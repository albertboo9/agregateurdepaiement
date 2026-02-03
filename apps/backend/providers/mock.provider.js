import { PaymentProviderInterface } from "./base/provider.interface.js";
import { PaymentStatus } from "../enums/index.js";

export class MockProvider extends PaymentProviderInterface {
    constructor(name, shouldFail = false) {
        super();
        this.name = name;
        this.shouldFail = shouldFail;
    }

    async createPayment(paymentData) {
        console.log(`[MockProvider:${this.name}] Creating payment for ${paymentData.amount} ${paymentData.currency}`);

        if (this.shouldFail) {
            return {
                success: false,
                errorCode: "MOCK_FAILURE",
                errorMessage: `Simulated failure for ${this.name}`,
            };
        }

        return {
            success: true,
            transactionNumber: `MOCK-TXN-${Date.now()}`,
            status: PaymentStatus.SUCCEEDED,
            response: { message: "Mock success" }
        };
    }

    async checkStatus(transactionNumber) {
        return { success: true, status: PaymentStatus.SUCCEEDED };
    }

    mapStatus(status) {
        return PaymentStatus.SUCCEEDED;
    }
}
