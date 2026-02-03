# Payment Aggregator Backend (PSP)

A robust Payment Service Provider (PSP) backend built with Node.js, Express, and Sequelize.

## 🚀 Features

- **Multi-Provider Support**: Integrated with Stripe and CinetPay.
- **Intelligent Routing**: Automatically selects the best provider based on country, currency, and amount.
- **Failover & Fallback**: Automatically tries alternative providers if the primary one fails.
- **Webhooks Handling**: Asynchronous processing of payment events with signature validation.
- **Installment Plans**: Support for recurring/split payments.
- **Clean Architecture**: Separation of concerns between Models, Services, and Providers.

## 🛠️ Architecture

- **Models**: Database schema definitions using Sequelize.
- **Services**: Business logic layer (Orchestrator, Router, etc.).
- **Providers**: Adapter pattern implementation for third-party gateways.
- **Enums**: Centralized constants for statuses and codes.

## 🧪 Testing

The project uses **Jest** for unit and integration testing.

Run all tests:
```bash
npm test
```

Currently implemented unit tests:
- `OrderService`: Reference generation and creation logic.
- `ProviderRouterService`: Routing and availability filtering.
- `ProviderSelectorService`: Success/Failure fallback orchestration.

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in your credentials:
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `CINETPAY_API_KEY`
- `CINETPAY_SITE_ID`
