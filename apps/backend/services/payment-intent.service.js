import { PaymentIntent } from "../models/payment-intent.model.js";
import { PaymentStatus } from "../enums/index.js";
import { v4 as uuidv4 } from "../utils/uuid.js";

export class PaymentIntentService {
    /**
     * Create a payment intent
     * @param {Object} data 
     * @param {string} idempotencyKey 
     * @returns {Promise<PaymentIntent>}
     */
    static async create(data, idempotencyKey = null) {
        // Note: Idempotency check should be handled here or in a dedicated service
        if (idempotencyKey) {
            const existing = await this.findByIdempotencyKey(idempotencyKey);
            if (existing) return existing;
        }

        const intent = await PaymentIntent.create({
            orderId: data.orderId,
            amount: data.amount,
            currency: data.currency,
            status: PaymentStatus.CREATED,
            idempotencyKey: idempotencyKey || uuidv4(),
            metadata: data.metadata || {},
        });

        return intent;
    }

    /**
     * Find intent by ID
     * @param {number|string} id 
     * @returns {Promise<PaymentIntent>}
     */
    static async findById(id) {
        return await PaymentIntent.findByPk(id, {
            include: ["order", "selectedProvider", "attempts"],
        });
    }

    /**
     * Update intent status and selected provider
     * @param {number|string} id 
     * @param {string} status 
     * @param {number} providerId 
     * @returns {Promise<[number]>}
     */
    static async updateStatus(id, status, providerId = null) {
        const updateData = { status };
        if (providerId) updateData.selectedProviderId = providerId;

        return await PaymentIntent.update(updateData, { where: { id } });
    }

    /**
     * Find intent by idempotency key
     * @param {string} key 
     * @returns {Promise<PaymentIntent>}
     */
    static async findByIdempotencyKey(key) {
        return await PaymentIntent.findOne({
            where: { idempotencyKey: key },
            include: ["order"]
        });
    }
}
