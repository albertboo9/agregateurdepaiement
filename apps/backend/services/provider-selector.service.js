import { ProviderRouterService } from "./provider-router.service.js";
import { PaymentAttemptService } from "./payment-attempt.service.js";
import { PaymentIntentService } from "./payment-intent.service.js";
import { PaymentStatus } from "../enums/index.js";

export class ProviderSelectorService {
    /**
     * @param {PaymentIntent} paymentIntent 
     */
    constructor(paymentIntent) {
        this.paymentIntent = paymentIntent;
        this.routes = [];
        this.currentRouteIndex = 0;
    }

    /**
     * Initialize candidate routes
     * @param {string} paymentMethod 
     * @param {string} countryCode 
     * @returns {Promise<ProviderRoute[]>}
     */
    async initialize(paymentMethod, countryCode = "CM") {
        const rawRoutes = await ProviderRouterService.findAvailableRoutes(
            countryCode,
            this.paymentIntent.currency,
            this.paymentIntent.amount
        );

        this.routes = ProviderRouterService.filterByPaymentMethod(
            rawRoutes,
            paymentMethod
        );

        return this.routes;
    }

    /**
     * Get next provider to try
     * @returns {Object|null}
     */
    getNextProvider() {
        if (this.currentRouteIndex >= this.routes.length) {
            return null;
        }

        const route = this.routes[this.currentRouteIndex];
        this.currentRouteIndex++;

        return {
            provider: route.provider,
            route,
            attemptNumber: this.currentRouteIndex,
        };
    }

    /**
     * Execute payment with automatic fallback
     * @param {Function} paymentFunction - Function(provider, attempt) => result
     * @param {number} maxAttempts 
     * @returns {Promise<Object>}
     */
    async executeWithFallback(paymentFunction, maxAttempts = 3) {
        const results = {
            success: false,
            attempt: null,
            error: null,
            errors: [], // Collect all errors for transparency
            provider: null,
        };

        const limit = Math.min(maxAttempts, this.routes.length);

        for (let i = 0; i < limit; i++) {
            const next = this.getNextProvider();
            if (!next) break;

            let attempt = null;
            try {
                console.log(`[ProviderSelector] Attempting payment with provider: ${next.provider.name} (Priority: ${next.route.priority})`);

                // 1. Create Attempt
                attempt = await PaymentAttemptService.create({
                    paymentIntentId: this.paymentIntent.id,
                    providerId: next.provider.id,
                    transactionNumber: this.generateTransactionNumber(),
                    requestPayload: {},
                });

                // 2. Mark as Processing
                await PaymentAttemptService.markProcessing(attempt.id);

                // 3. Execute Payment
                const result = await paymentFunction(next.provider, attempt);

                if (result.success) {
                    console.log(`[ProviderSelector] Success with ${next.provider.name}`);
                    await PaymentAttemptService.markSuccess(attempt.id, result.response);
                    await PaymentIntentService.updateStatus(
                        this.paymentIntent.id,
                        PaymentStatus.SUCCEEDED,
                        next.provider.id
                    );

                    results.success = true;
                    results.attempt = attempt;
                    results.provider = next.provider;
                    results.providerResponse = result;
                    return results;
                } else {
                    const errorMsg = result.errorMessage || "Unknown provider error";
                    console.error(`[ProviderSelector] Provider ${next.provider.name} failed: ${errorMsg}`, result.response);

                    await PaymentAttemptService.markFailed(
                        attempt.id,
                        result.errorCode || "PROVIDER_ERROR",
                        errorMsg,
                        result.response || {}
                    );

                    results.errors.push({
                        provider: next.provider.name,
                        code: result.errorCode,
                        message: errorMsg
                    });
                    results.error = errorMsg; // Keep last error for compatibility
                }
            } catch (error) {
                console.error(`[ProviderSelector] Critical exception with ${next.provider.name}:`, error);
                if (attempt) {
                    await PaymentAttemptService.markFailed(
                        attempt.id,
                        "INTERNAL_EXCEPTION",
                        error.message
                    );
                }
                results.errors.push({
                    provider: next.provider.name,
                    code: "INTERNAL_EXCEPTION",
                    message: error.message
                });
                results.error = error.message;
            }

            if (i < limit - 1) {
                console.log(`⚠️ Trying next fallback...`);
            }
        }

        console.error(`[ProviderSelector] All ${limit} payment attempts failed.`);

        // All fallbacks failed
        await PaymentIntentService.updateStatus(
            this.paymentIntent.id,
            PaymentStatus.FAILED
        );

        return results;
    }

    /**
     * Generate internal transaction number for the attempt
     * @returns {string}
     */
    generateTransactionNumber() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    }
}
