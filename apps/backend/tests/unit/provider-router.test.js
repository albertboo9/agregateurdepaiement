import { ProviderRouterService } from "../../services/provider-router.service.js";
import { ProviderRoute } from "../../models/provider-route.model.js";
import { jest } from "@jest/globals";

describe("ProviderRouterService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should find available routes", async () => {
        const mockRoutes = [
            { id: 1, provider: { name: "Stripe", supportCard: true } },
            { id: 2, provider: { name: "CinetPay", supportCard: true } }
        ];

        jest.spyOn(ProviderRoute, 'findAll').mockResolvedValue(mockRoutes);

        const routes = await ProviderRouterService.findAvailableRoutes("CM", "XAF", 5000);

        expect(ProviderRoute.findAll).toHaveBeenCalled();
        expect(routes).toHaveLength(2);
    });

    test("should filter routes by payment method", () => {
        const mockRoutes = [
            { provider: { supportCard: true, supportMobileMoney: false } }, // Card only
            { provider: { supportCard: false, supportMobileMoney: true } }  // Mobile only
        ];

        const cardRoutes = ProviderRouterService.filterByPaymentMethod(mockRoutes, "card");
        const mmRoutes = ProviderRouterService.filterByPaymentMethod(mockRoutes, "mobile_money");

        expect(cardRoutes).toHaveLength(1);
        expect(mmRoutes).toHaveLength(1);
    });
});
