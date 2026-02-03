# 🔌 Provider Integration Guide

The Studies Aggregator is designed for extreme scalability. Adding a new payment gateway should take less than 1 hour if you follow this guide.

---

## 🏗️ The Adapter Pattern

Every provider in this system is an **Adapter**. They must all implement the same "Interface" (contract) to be compatible with the core Engine.

### Required Methods

| Method | Description |
|--------|-------------|
| `createPayment(data)` | Connects to the gateway and returns a `redirectUrl`. |
| `checkStatus(reference)` | Manual polling if a webhook is delayed. |
| `validateWebhook(req)` | Verifies the packet signature and maps to internal status. |
| `mapStatus(providerStatus)`| Converts external status (e.g., `succeeded`) to internal `AttemptStatus`. |

---

## 🛠️ Step-by-Step Integration (Example: Kkiapay)

### 1. File Structure

Create a new directory under `providers/`:

```text
apps/backend/providers/kkiapay/
├── kkiapay.service.js
└── index.js
```

### 2. Implementation Template

Copy this boilerplate into `kkiapay.service.js`:

```javascript
import { PaymentProviderInterface } from '../base/provider.interface.js';
import { AttemptStatus } from '../../enums/index.js';

export class KkiapayService extends PaymentProviderInterface {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
  }

  async createPayment(data) {
    try {
      // 1. Call Kkiapay API
      // 2. Map response
      return {
        success: true,
        redirectUrl: "https://kkiapay.com/...",
        providerReference: "kkiapay-unique-id"
      };
    } catch (error) {
           return { success: false, errorMessage: error.message };
    }
  }

  async validateWebhook(payload, signature) {
    // Implement HMAC checking logic here
    return true;
  }

  mapStatus(externalStatus) {
    const mapping = {
      'SUCCESS': AttemptStatus.SUCCEEDED,
      'FAILED': AttemptStatus.FAILED
    };
    return mapping[externalStatus] || AttemptStatus.PROCESSING;
  }
}
```

### 3. Registry Registration

Open `apps/backend/providers/index.js` and add your new service to the factory:

```javascript
import { KkiapayService } from './kkiapay/kkiapay.service.js';

export const ProviderFactory = {
  create(providerCode, config) {
    switch (providerCode.toUpperCase()) {
      case 'KKIAPAY': return new KkiapayService(config);
      // ... others
    }
  }
};
```

---

## 🗄️ 4. DB Configuration

The backend is dynamic. You don't need to redeploy the code for the Router to start using the new provider.

1. **Insert the Provider**:

   ```sql
   INSERT INTO aggp_payment_providers (id, code, name, is_active) 
   VALUES (3, 'KKIAPAY', 'Kkiapay Africa', 1);
   ```

2. **Add Routes**:

   ```sql
   INSERT INTO aggp_provider_routes (country_code, currency, payment_method, provider_id, priority)
   VALUES ('BJ', 'XOF', 'mobile_money', 3, 100);
   ```

---

## 🧪 Testing your Integration

1. **Unit Test**: Duplicate a test from `tests/unit/adapters/` and adapt it.
2. **Integration Test**:
   - Start the server.
   - Use Postman to call `/api/payments/init` with `countryCode: 'BJ'`.
   - Verify that you are redirected to the Kkiapay checkout page.
