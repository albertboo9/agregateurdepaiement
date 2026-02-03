# 📖 API Reference - Studies Aggregator v1.0

This document provides a comprehensive specification of all available endpoints in the Studies Payment Gateway.

## 🔐 Base Configuration

- **Base URL**: `http://localhost:3000` (Development)
- **Protocol**: HTTP/1.1 (HTTPS required in Production)
- **Format**: All requests and responses are in `application/json`

---

## 🛠️ Authentication

All requests to `/api/*` endpoints require an API Key.

| Header | Description | Required |
|--------|-------------|----------|
| `Content-Type` | Must be `application/json` | Yes |
| `X-API-KEY` | Your secret API key (provided by admin) | Yes |

---

## 📡 Endpoints

### 1. Health & Monitoring

#### `GET /health`

Verify the status of the API and its connection to the database.

**Response (200 OK)**:

```json
{
  "status": "ok",
  "timestamp": "2026-02-02T12:00:00.000Z",
  "environment": "development"
}
```

---

### 2. Payment Operations

#### `POST /api/payments/init`

Starts a new payment flow. This endpoint is intelligent: it will automatically select the best provider based on your parameters.

**Request Body**:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `customerEmail` | `String` | Valid email for receipt and notifications | Yes |
| `customerName` | `String` | Full name of the customer | Yes |
| `amount` | `Number` | The transaction amount (decimal supported) | Yes |
| `currency` | `String` | 3-letter ISO code (e.g., `XAF`, `EUR`) | Yes |
| `paymentMethod` | `Enum` | `card` or `mobile_money` | Yes |
| `countryCode` | `String` | 2-letter ISO code (e.g., `CM`, `FR`) | Yes |
| `successUrl` | `String` | Redirect URL after successful payment | Yes |
| `cancelUrl` | `String` | Redirect URL if user cancels | Yes |
| `metadata` | `Object` | Arbitrary JSON to store with the order | No |

**Example Request**:

```json
{
  "customerEmail": "client@example.com",
  "customerName": "John Doe",
  "amount": 1500,
  "currency": "XAF",
  "paymentMethod": "mobile_money",
  "countryCode": "CM",
  "successUrl": "https://client.com/success",
  "cancelUrl": "https://client.com/cancel"
}
```

**Response (201 Created)**:

```json
{
  "status": "success",
  "data": {
    "paymentIntentId": "pi_abc123...",
    "orderReference": "ORD-XYZ-789",
    "redirectUrl": "https://checkout.provider.com/session/...",
    "providerUsed": "CINETPAY"
  }
}
```

**Response (400 Bad Request / Failed Attempts)**:

```json
{
  "status": "fail",
  "data": {
    "success": false,
    "orderReference": "ORD-XYZ-789",
    "paymentIntentId": 4,
    "error": "Last attempt error: Invalid API Key",
    "errors": [
      { "provider": "CinetPay", "code": "CINETPAY_401", "message": "Invalid API Key" },
      { "provider": "Stripe", "code": "STRIPE_ERR", "message": "Card declined" }
    ]
  }
}
```

**Response (400 Validation Error)**:

```json
{
  "status": "error",
  "message": "Invalid email format",
  "errors": [ { "path": "customerEmail", "message": "Invalid email" } ]
}
```

---

#### `GET /api/payments/:intentId/status`

Check the real-time status of a payment intent.

**Parameters**:

- `intentId`: String (e.g., `pi_abc123...`)

**Response (200 OK)**:

```json
{
  "status": "success",
  "data": {
    "intentId": "pi_abc123",
    "status": "SUCCEEDED",
    "amount": 1500,
    "currency": "XAF",
    "orderReference": "ORD-XYZ-789",
    "customer": { "name": "John Doe", "email": "client@example.com" }
  }
}
```

---

## 🪝 Webhooks

Providers notify the aggregator asynchronously via webhooks.

### Supported Providers

- **Stripe**: `POST /api/webhooks/stripe`
- **CinetPay**: `POST /api/webhooks/cinetpay`

### Security

Webhooks are secured by signature verification (HMAC or Provider-specific).

- **Stripe**: Uses `stripe-signature` header.
- **CinetPay**: Uses payload HMAC verification.

---

## 📊 Standard Error Codes

The API uses standard HTTP error codes:

| Code | Meaning | Solution |
|------|---------|----------|
| `400` | Bad Request | Check request body validation |
| `401` | Unauthorized | Missing or invalid `X-API-KEY` |
| `403` | Forbidden | IP not whitelisted (if enabled) |
| `404` | Not Found | Resource or route does not exist |
| `422` | Unprocessable Entity | Logic error (e.g., no provider for this route) |
| `500` | Server Error | Internal issue, check logs |
