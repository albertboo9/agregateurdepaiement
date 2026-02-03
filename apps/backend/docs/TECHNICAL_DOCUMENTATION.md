# � Documentation Hub - Studies Payment Engine

Welcome to the official technical documentation for the Studies Payment Aggregator. This system is designed to provide a unified API for multiple payment providers (Stripe, CinetPay, etc.) with built-in resilience and intelligent routing.

---

## 🗺️ Navigation

### 🚀 Getting Started

- **[Installation & Setup](file:///home/albert/agregateurdepaiement/apps/backend/docs/SETUP_GUIDE.md)**: How to get the system running in development and production.
- **[Postman Testing Guide](file:///home/albert/agregateurdepaiement/apps/backend/tests/POSTMAN_GUIDE.md)**: Manual verification protocol.

### 📖 API Reference

- **[REST API Specification](file:///home/albert/agregateurdepaiement/apps/backend/docs/API_REFERENCE.md)**: Exhaustive details on endpoints, request parameters, and responses.

### 🏗️ Architecture & Core Concepts

- **[Architecture Deep Dive](file:///home/albert/agregateurdepaiement/apps/backend/docs/ARCHITECTURE_GUIDE.md)**: Internal design, design patterns, and Mermaid logic flows.
- **[Security & Integrity](file:///home/albert/agregateurdepaiement/apps/backend/docs/SECURITY_GUIDE.md)**: How we protect transactions and validate webhooks.

### 🔌 Extending the System

- **[Provider Integration Guide](file:///home/albert/agregateurdepaiement/apps/backend/docs/PROVIDER_INTEGRATION_GUIDE.md)**: Step-by-step tutorial on adding new gateways (adapters).

---

## 📈 Key High-Level Features

| Feature | Description |
|---------|-------------|
| **Multi-Provider** | Support for Stripe, CinetPay, Maviance, Kkiapay. |
| **Failover Logic** | Automatic retry on secondary providers if the primary fails. |
| **Intelligent Routing** | Dynamic provider selection based on Country, Currency, and Method. |
| **Auto-Invoicing** | Professional PDF generation and email notification upon success. |
| **Idempotency** | Prevents double-charging via unique intent keys. |

---

## 👥 Support & Contributions

For any questions regarding this backend, please contact the **Studies Holding Technical Team**.
