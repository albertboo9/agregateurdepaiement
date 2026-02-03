import { ProviderRoute } from "../models/provider-route.model.js";
import { PaymentProvider } from "../models/payment-provider.model.js";
import { Op } from "sequelize";

export class ProviderRouterService {
    /**
     * Find all available routes for a country/currency/amount
     * @param {string} countryCode 
     * @param {string} currency 
     * @param {number} amount 
     * @returns {Promise<ProviderRoute[]>}
     */
    static async findAvailableRoutes(countryCode, currency, amount) {
        // 1. Try to find specific routes for this country
        const specificRoutes = await ProviderRoute.findAll({
            where: {
                countryCode,
                isActive: true,
                [Op.and]: [
                    { minAmount: { [Op.lte]: amount } },
                    {
                        [Op.or]: [{ maxAmount: { [Op.gte]: amount } }, { maxAmount: null }],
                    },
                ],
            },
            include: [
                {
                    model: PaymentProvider,
                    as: "provider",
                    where: { isActive: true },
                },
            ],
            order: [["priority", "ASC"]],
        });

        if (specificRoutes.length > 0) {
            return specificRoutes;
        }

        // 2. Fallback to wildcard '*' if no specific route found
        console.log(`[ProviderRouterService] No specific route for ${countryCode}, falling back to wildcard '*'`);
        return await ProviderRoute.findAll({
            where: {
                countryCode: '*',
                isActive: true,
                [Op.and]: [
                    { minAmount: { [Op.lte]: amount } },
                    {
                        [Op.or]: [{ maxAmount: { [Op.gte]: amount } }, { maxAmount: null }],
                    },
                ],
            },
            include: [
                {
                    model: PaymentProvider,
                    as: "provider",
                    where: { isActive: true },
                },
            ],
            order: [["priority", "ASC"]],
        });
    }

    /**
     * Filter routes by payment method type
     * @param {ProviderRoute[]} routes 
     * @param {string} paymentMethod (card or mobile_money)
     * @returns {ProviderRoute[]}
     */
    static filterByPaymentMethod(routes, paymentMethod) {
        const methodField =
            paymentMethod === "card" ? "supportCard" : "supportMobileMoney";

        return routes.filter((route) => {
            const provider = route.provider;
            return provider[methodField] === true;
        });
    }

    /**
     * Create a new route
     * @param {Object} data 
     * @returns {Promise<ProviderRoute>}
     */
    static async createRoute(data) {
        return await ProviderRoute.create(data);
    }
}
