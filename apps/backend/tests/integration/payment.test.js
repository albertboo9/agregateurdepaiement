import request from "supertest";
import app from "../../app.js";
import { sequelize } from "../../models/index.js";
import { OrchestratorService } from "../../services/orchestrator.service.js";
import { ApiKeyService } from "../../services/api-key.service.js";
import { jest } from "@jest/globals";

const API_KEY = "test_api_key";

describe("Payment API Integration", () => {
    beforeAll(async () => {
        // Prevent DB connection in tests
        jest.spyOn(sequelize, 'authenticate').mockResolvedValue();
        jest.spyOn(sequelize, 'sync').mockResolvedValue();

        // Mock API Key validation
        jest.spyOn(ApiKeyService, 'validate').mockImplementation(async (key) => key === API_KEY);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe("GET /health", () => {
        test("should return 200 OK", async () => {
            const res = await request(app).get("/health");
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual("ok");
        });
    });

    describe("POST /api/payments/init", () => {
        test("should return 401 if API Key is missing", async () => {
            const res = await request(app)
                .post("/api/payments/init")
                .send({ amount: 1000 });

            expect(res.statusCode).toEqual(401);
        });

        test("should return 400 if validation fails", async () => {
            const res = await request(app)
                .post("/api/payments/init")
                .set("X-API-KEY", API_KEY)
                .send({ amount: -10 }); // Invalid amount

            expect(res.statusCode).toEqual(400);
        });

        test("should return 201 if valid request", async () => {
            const mockResult = {
                success: true,
                orderReference: "ORD-123",
                redirectUrl: "https://checkout.stripe.com/test"
            };

            jest.spyOn(OrchestratorService, 'initializePayment').mockResolvedValue(mockResult);

            const res = await request(app)
                .post("/api/payments/init")
                .set("X-API-KEY", API_KEY)
                .send({
                    customerEmail: "test@example.com",
                    currency: "XAF",
                    amount: 5000,
                    paymentMethod: "card",
                    countryCode: "CM",
                    successUrl: "https://example.com/success",
                    cancelUrl: "https://example.com/cancel"
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.data.success).toBe(true);
            expect(res.body.data.redirectUrl).toBe(mockResult.redirectUrl);
        });
    });
});
