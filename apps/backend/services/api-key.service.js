import { ApiKey } from "../models/index.js";
import crypto from 'node:crypto';

export class ApiKeyService {
    /**
     * Generate a new API key
     * @param {string} owner 
     * @returns {Promise<ApiKey>}
     */
    static async generate(owner) {
        const key = `sk_${crypto.randomBytes(24).toString('hex')}`;

        return await ApiKey.create({
            key,
            owner,
            isActive: true
        });
    }

    /**
     * Validate an API key
     * @param {string} key 
     * @returns {Promise<boolean>}
     */
    static async validate(key) {
        if (!key) return false;

        const apiKey = await ApiKey.findOne({
            where: { key, isActive: true }
        });

        if (apiKey) {
            apiKey.lastUsedAt = new Date();
            await apiKey.save();
            return true;
        }

        return false;
    }
}
