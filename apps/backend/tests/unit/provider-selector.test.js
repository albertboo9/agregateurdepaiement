import { ProviderSelectorService } from "../../services/provider-selector.service.js";
import { PaymentAttemptService } from "../../services/payment-attempt.service.js";
import { PaymentIntentService } from "../../services/payment-intent.service.js";
import { ProviderRouterService } from "../../services/provider-router.service.js";
import { jest } from "@jest/globals";

describe("ProviderSelectorService", () => {
    let mockIntent;

    beforeEach(() => {
        mockIntent = { id: 1, amount: 1000, currency: "XAF" };
        jest.clearAllMocks();

        // Setup spies
        jest.spyOn(ProviderRouterService, 'findAvailableRoutes');
        jest.spyOn(ProviderRouterService, 'filterByPaymentMethod');
        jest.spyOn(PaymentIntentService, 'updateStatus').mockResolvedValue(true);
        jest.spyOn(PaymentAttemptService, 'create');
        jest.spyOn(PaymentAttemptService, 'markProcessing');
        jest.spyOn(PaymentAttemptService, 'markFailed');
        jest.spyOn(PaymentAttemptService, 'markSuccess');
    });

    test("should execute with fallback when first provider fails", async () => {
        const mockRoutes = [
            { provider: { id: 101, name: "Provider A", supportMobileMoney: true } },
            { provider: { id: 102, name: "Provider B", supportMobileMoney: true } }
        ];

        ProviderRouterService.findAvailableRoutes.mockResolvedValue(mockRoutes);
        ProviderRouterService.filterByPaymentMethod.mockReturnValue(mockRoutes);

        PaymentAttemptService.create.mockImplementation((data) => ({ id: Math.random() }));
        PaymentAttemptService.markProcessing.mockResolvedValue(true);
        PaymentAttemptService.markFailed.mockResolvedValue(true);
        PaymentAttemptService.markSuccess.mockResolvedValue(true);

        const selector = new ProviderSelectorService(mockIntent);
        await selector.initialize("mobile_money", "CM");

        // Mock payment function
        const paymentFunc = jest.fn()
            .mockResolvedValueOnce({ success: false, errorMessage: "Failed A" })
            .mockResolvedValueOnce({ success: true, response: { ok: true } });

        const result = await selector.executeWithFallback(paymentFunc);

        expect(result.success).toBe(true);
        expect(result.provider.name).toBe("Provider B");
        expect(paymentFunc).toHaveBeenCalledTimes(2);
        expect(PaymentAttemptService.markFailed).toHaveBeenCalledTimes(1);
        expect(PaymentAttemptService.markSuccess).toHaveBeenCalledTimes(1);
    });
});
