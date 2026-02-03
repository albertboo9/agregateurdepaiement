import { WebhookProcessor } from "../services/index.js";
import { HttpStatus } from "../enums/index.js";

export class WebhookController {
    /**
     * Handle CinetPay Webhooks
     */
    static async cinetpay(req, res) {
        console.log("[Webhook] Received CinetPay notification");

        // Process async
        await WebhookProcessor.processEvent('cinetpay', req.body);

        res.status(HttpStatus.OK).send("OK");
    }

    /**
     * Handle Stripe Webhooks
     */
    static async stripe(req, res) {
        console.log("[Webhook] Received Stripe notification");

        const signature = req.headers['stripe-signature'];

        // Process async (In production we'd validate signature here)
        await WebhookProcessor.processEvent('stripe', req.body, signature);

        res.status(HttpStatus.OK).json({ received: true });
    }
}
