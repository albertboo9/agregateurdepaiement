import { OrchestratorService, PaymentIntentService } from "../services/index.js";
import { EmailVerificationService } from "../services/email-verification.service.js";
import { initPaymentSchema } from "../utils/validators.js";
import { HttpStatus } from "../enums/index.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

export class PaymentController {
    /**
     * Initialize a payment
     */
    static async initialize(req, res) {
        console.log(`[PaymentController] Initializing payment for ${req.body.customerEmail}...`);

        // 1. Validation du request body
        const validation = initPaymentSchema.safeParse(req.body);
        if (!validation.success) {
            console.warn(`[PaymentController] Validation failed:`, validation.error.errors[0].message);
            throw new BadRequestError(validation.error.errors[0].message);
        }

        // 2. Call Orchestrator
        const result = await OrchestratorService.initializePayment(validation.data);

        if (!result.success) {
            console.error(`[PaymentController] Orchestrator failed:`, result.error);
            return res.status(HttpStatus.BAD_REQUEST).json({
                status: "fail",
                data: result
            });
        }

        console.log(`[PaymentController] Payment initialized successfully: ${result.orderReference}`);
        res.status(HttpStatus.CREATED).json({
            status: "success",
            data: result
        });
    }

    /**
     * Get payment status
     */
    static async getStatus(req, res) {
        const { id } = req.params;

        const intent = await PaymentIntentService.findById(id);
        if (!intent) {
            throw new NotFoundError("Payment intent not found");
        }

        res.status(HttpStatus.OK).json({
            status: "success",
            data: {
                id: intent.id,
                status: intent.status,
                amount: intent.amount,
                currency: intent.currency,
                orderReference: intent.order?.reference,
                attempts: intent.attempts?.map(a => ({
                    id: a.id,
                    provider: a.provider?.name,
                    status: a.status,
                    createdAt: a.createdAt
                }))
            }
        });
    }

    /**
     * Verify email with 6-digit code
     */
    static async verifyEmail(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            throw new BadRequestError("L'email et le code sont requis.");
        }

        const result = await EmailVerificationService.verifyCode(email, code);

        if (!result.success) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                status: "fail",
                message: result.message
            });
        }

        res.status(HttpStatus.OK).json({
            status: "success",
            message: "Email vérifié avec succès."
        });
    }

    /**
     * Request a new verification code
     */
    static async requestVerificationCode(req, res) {
        const { email } = req.body;

        if (!email) {
            throw new BadRequestError("L'email est requis.");
        }

        const result = await EmailVerificationService.generateAndSendCode(email);

        res.status(HttpStatus.OK).json({
            status: "success",
            message: "Un nouveau code a été envoyé.",
            data: {
                expiresAt: result.expiresAt
            }
        });
    }
}
