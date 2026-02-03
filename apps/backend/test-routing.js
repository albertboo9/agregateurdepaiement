import { OrderService, PaymentIntentService, ProviderSelectorService } from "./services/index.js";
import { MockProvider } from "./providers/mock.provider.js";
import { sequelize } from "./models/index.js";

async function testRouting() {
    try {
        console.log("--- Testing Routing & Fallback ---");

        // 1. Create Order
        const order = await OrderService.create({
            customerEmail: "test@example.com",
            customerName: "Test User",
            currency: "XAF",
            totalAmount: 5000,
        });
        console.log("Order created:", order.reference);

        // 2. Create Payment Intent
        const intent = await PaymentIntentService.create({
            orderId: order.id,
            amount: order.totalAmount,
            currency: order.currency,
        });
        console.log("Payment Intent created:", intent.id);

        // 3. Setup Selector
        const selector = new ProviderSelectorService(intent);
        await selector.initialize("mobile_money", "CM");
        console.log(`Found ${selector.routes.length} candidate routes.`);

        // 4. Define a mock payment function that fails on the first provider
        const paymentFunction = async (provider, attempt) => {
            // Simulate failure for CinetPay, success for others
            const shouldFail = provider.code === 'cinetpay';
            const mock = new MockProvider(provider.name, shouldFail);
            return await mock.createPayment({
                amount: intent.amount,
                currency: intent.currency,
                orderId: order.id,
                paymentIntentId: intent.id
            });
        };

        // 5. Execute with fallback
        console.log("Executing with fallback...");
        const result = await selector.executeWithFallback(paymentFunction);

        if (result.success) {
            console.log(`✅ Success! Paid with ${result.provider.name}`);
            console.log(`Attempt ID: ${result.attempt.id}`);
            console.log(`Transaction ID: ${result.attempt.transactionNumber}`);
        } else {
            console.log(`❌ All fallbacks failed: ${result.error}`);
        }

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await sequelize.close();
    }
}

testRouting();
