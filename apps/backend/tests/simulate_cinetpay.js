import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const API_KEY = process.env.CINETPAY_API_KEY;
const SITE_ID = process.env.CINETPAY_SITE_ID;
const WEBHOOK_URL = "http://localhost:3000/api/webhooks/cinetpay";

/**
 * Simulate a CinetPay Webhook call
 */
async function simulateCinetPayWebhook(transactionId, amount = 100, currency = "XAF") {
    if (!API_KEY || !SITE_ID) {
        console.error("❌ Error: CINETPAY_API_KEY or CINETPAY_SITE_ID missing in .env");
        return;
    }

    const payload = {
        cpm_site_id: SITE_ID,
        cpm_trans_id: transactionId,
        cpm_trans_date: new Date().toISOString(),
        cpm_amount: amount,
        cpm_currency: currency,
        cpm_result: '00',
        cpm_trans_status: 'ACCEPTED',
        cpm_designation: 'Test Payment',
        cpm_custom: JSON.stringify({ test: true })
    };

    // Calculate x-token (HMAC SHA256 of the JSON body)
    const hmac = crypto.createHmac('sha256', API_KEY);
    const xToken = hmac.update(JSON.stringify(payload)).digest('hex');

    console.log("--------------------------------------------------");
    console.log(`🚀 Simulating CinetPay Webhook...`);
    console.log(`🔗 Target: ${WEBHOOK_URL}`);
    console.log(`📄 Using ID: ${transactionId}`);

    if (transactionId.startsWith('ORD-')) {
        console.log("⚠️ WARNING: You are using an Order Reference (ORD-...).");
        console.log("👉 Webhooks usually expect the Transaction Number (TXN-...).");
        console.log("👉 Check your /init response for the 'transactionNumber' field.");
    }
    console.log("--------------------------------------------------");

    try {
        // CinetPay sends data as x-www-form-urlencoded
        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-token': xToken
            },
            body: formData.toString()
        });

        const text = await response.text();
        console.log(`\n✅ Server Status: ${response.status}`);
        console.log(`✅ Server Response: ${text}`);
        console.log("\n👀 Important: Check your server terminal/logs to see the verification results!");
    } catch (error) {
        console.error(`\n❌ Error during simulation: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            console.error("👉 Is your server running on port 3000?");
        }
    }
}

// Execution
const txId = process.argv[2];
if (!txId) {
    console.log("\n❌ Usage: node simulate_cinetpay.js <transaction_id>");
    console.log("💡 Tip: Use a transaction ID from a previously initialized payment.");
    process.exit(1);
}

simulateCinetPayWebhook(txId);
