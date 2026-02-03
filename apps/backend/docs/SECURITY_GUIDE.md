# 🔒 Security & Data Integrity Guide

Security is a foundational pillar of the Studies Payment Engine. This document outlines the protocols and practices implemented to protect sensitive data.

---

## 🔑 1. API Authentication

External clients (WordPress, Apps) interact with the backend using a **Secret API Key**.

- **Transport**: All keys must be transmitted via the `X-API-KEY` header.
- **Verification**: The `auth.middleware.js` checks every request against the `aggp_api_keys` table.
- **Requirement**: Plain-text keys are stored as hashes (future enhancement) or unique UUIDs.

---

## 🛡️ 2. Webhook Security

Webhooks from external gateways (Stripe, CinetPay) are the most vulnerable entry points.

### Stripe

We use the official `stripe.webhooks.constructEvent` with your **Webhook Signing Secret**. This protects against:

- **Replay attacks**: Checks timestamps.
- **Payload tampering**: Verified via HMAC signature.

### CinetPay

We manually verify the HMAC signature of the incoming JSON body using the `CINETPAY_API_KEY`.

- **Validation Logic**: `SignatureValidator.verifyHmac(payload, receivedSignature, secret)`.

---

## 🧩 3. Idempotency

To prevent accidental double charges (e.g., a user clicks "Pay" twice), we implement **Idempotency Keys**.

- **Implementation**: The `PaymentIntent` stores an `idempotencyKey`.
- **Behavior**: If a second request arrives with the same key, the system returns the existing `PaymentIntentId` instead of creating a new one.

---

## 👁️ 4. Data Privacy (GDPR/Compliance)

While we are a middle layer, we minimize the storage of PII (Personally Identifiable Information).

- **Strict Rule**: We **NEVER** store full credit card numbers, CVVs, or expiry dates in our database. These are handled directly by the PCI-DSS compliant gateways (Stripe/CinetPay).
- **PCI Scope**: By using "Redirect" or "Embedded Elements" (Stripe Elements), our backend stays out of PCI-DSS scope.

---

## 📡 5. Environment Isolation

- **Development**: Use `sk_test_...` keys and Sandbox environments.
- **Production**:
  - SSL Certificate (TLS 1.2+).
  - Database encryption at rest.
  - Minimal database user privileges (GRANT limited to needed tables).
  - Secret keys managed via Environment Variables (not hardcoded).
