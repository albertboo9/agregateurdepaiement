/**
 * Interface that all payment providers must implement
 */
export class PaymentProviderInterface {
    /**
     * Create a payment
     * @param {Object} paymentData 
     * @returns {Promise<{success: boolean, transactionNumber?: string, redirectUrl?: string, status?: string, response?: Object, errorCode?: string, errorMessage?: string}>}
     */
    async createPayment(paymentData) {
        throw new Error("Method 'createPayment' not implemented");
    }

    /**
     * Check status of a payment
     * @param {string} transactionNumber 
     * @returns {Promise<{success: boolean, status: string, response?: Object, error?: string}>}
     */
    async checkStatus(transactionNumber) {
        throw new Error("Method 'checkStatus' not implemented");
    }

    /**
     * Refund a payment
     * @param {string} transactionNumber 
     * @param {number} amount 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async refund(transactionNumber, amount = null) {
        throw new Error("Method 'refund' not implemented");
    }

    /**
     * Validate webhook signature
     * @param {Object} payload 
     * @param {string} signature 
     * @returns {boolean}
     */
    validateWebhookSignature(payload, signature) {
        throw new Error("Method 'validateWebhookSignature' not implemented");
    }

    /**
     * Map provider specific status to internal PaymentStatus
     * @param {string} providerStatus 
     * @returns {string}
     */
    mapStatus(providerStatus) {
        throw new Error("Method 'mapStatus' not implemented");
    }
}
