import crypto from 'node:crypto';

/**
 * Utility for HMAC signature validation
 */
export class SignatureValidator {
    /**
     * Validate HMAC signature
     * @param {string|Buffer} payload 
     * @param {string} signature 
     * @param {string} secret 
     * @param {string} algorithm (sha256, sha512, etc.)
     * @returns {boolean}
     */
    static validateHmac(payload, signature, secret, algorithm = 'sha256') {
        if (!payload || !signature || !secret) return false;

        const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const hash = crypto
            .createHmac(algorithm, secret)
            .update(body)
            .digest('hex');

        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    }
}
