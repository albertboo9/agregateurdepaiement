# Payment Aggregator API - Postman Testing Guide

This document provides all the necessary information to test the Aggregator API using Postman.

## 🔒 Security

All payment endpoints are protected by an **API KEY**.
You must include the following header in every request:

| Header | Value |
|--------|-------|
| `X-API-KEY` | `sk_946dc8c08fb03ee7861c9ad30d6e8302362f23a75132498d` |

> [!IMPORTANT]
> This is a development key. In production, never share or expose your API keys.

---
vérifiction m:
POST /api/payments/verify-email
{
  "email": "client@example.com",
  "code": "123456"
}
## 🚀 Endpoints

### 1. Health Check

Checks if the API and Database are online.

- **Method**: `GET`
- **URL**: `{{baseUrl}}/health`
- **Auth**: None
- **Response**: `200 OK`

### 2. Initialize Payment

Creates a new order and returns the payment URL.

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/payments/init`
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-KEY: sk_946dc8c08fb03ee7861c9ad30d6e8302362f23a75132498d`
- **Body (JSON)**:

```json
{
  "customerEmail": "john.doe@example.com",
  "customerName": "John Doe",
  "currency": "XAF",
  "amount": 1000,
  "paymentMethod": "mobile_money",
  "countryCode": "CM",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel",
  "metadata": {
    "orderId": "123456"
  }
}
```

- **Response (201 Created)**:

```json
{
  "status": "success",
  "data": {
    "paymentIntentId": 2,
    "orderReference": "ORD-XYZ-123",
    "redirectUrl": "https://checkout.cinetpay.com/payment/...",
    "provider": "CinetPay"
  }
}
```

---

## 🧪 Stripe Test Case

To test Stripe, use `EUR` as currency and `card` as payment method.

**Request Body**:

```json
{
  "customerEmail": "test-stripe@example.com",
  "customerName": "Steve Stripe",
  "currency": "EUR",
  "amount": 42.00,
  "paymentMethod": "card",
  "countryCode": "FR",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

**Steps**:

1. Run the request.
2. Open the `redirectUrl` in your browser.
3. Use Stripe Test Cards (e.g., `4242 4242 4242 4242`) to complete the payment.

---

## 💳 Completing a Real Payment

1. **Get the `redirectUrl`**: After a successful `init` request, copy the `redirectUrl` from the response.
2. **Follow the Link**: Paste this URL in your browser.
3. **Choose Method**: On the CinetPay/Stripe page, choose "Mobile Money" or "Card".
4. **Phone Prompt**:
   - For **Mobile Money**, enter your phone number.
   - You will receive a real prompt on your phone (USSD) to confirm the transaction.
5. **Success**: Once confirmed on your phone, you will be redirected to your `successUrl`.

---

### 3. Get Payment Status

Retrieves the current status of a payment intent.

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/payments/{{intentId}}/status`
- **Headers**:
  - `X-API-KEY: sk_946dc8c08fb03ee7861c9ad30d6e8302362f23a75132498d`

---

## 🛠️ Postman Setup

1. **Environnement**: Create a new environment in Postman.
2. **Variables**:
    - `baseUrl`: `http://localhost:3000`
3. **Tests**: You can use the `init` response to set a variable for the `intentId`:

```javascript
const jsonData = pm.response.json();
if (jsonData.status === 'success') {
    pm.environment.set("intentId", jsonData.data.paymentIntentId);
}
```

## 📋 Common Error Codes (400)

| Error Message | Meaning |
|---------------|---------|
| `App identification failed...` | Wrong or missing API Key |
| `Invalid email` | The customerEmail format is wrong |
| `Expected number, received string` | The amount must be a numeric value |
| `No available provider...` | No route configured for this country/currency/method |
