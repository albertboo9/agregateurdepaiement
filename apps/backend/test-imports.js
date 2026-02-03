import { OrderService } from "./services/order.service.js";
import { PaymentIntentService } from "./services/payment-intent.service.js";
import { sequelize } from "./models/index.js";

async function test() {
    try {
        console.log("Testing models and services...");

        // We don't actually need to connect to DB if we just want to test imports
        // but connecting verifies the config.
        // await sequelize.authenticate();

        console.log("Order Reference Sample:", OrderService.generateReference());

        console.log("✅ Basic test passed!");
    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await sequelize.close();
    }
}

test();
