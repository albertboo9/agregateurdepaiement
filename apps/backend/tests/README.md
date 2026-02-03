# Testing Strategy

We follow a pyramid testing strategy to ensure the reliability of the PSP system.

## Unit Tests

Located in `tests/unit/`, these tests focus on individual services in isolation.
We use **Jest Mocks** to isolate services from their dependencies (mostly database models and external APIs).

### Focus Areas
- **Rounding & Precision**: Ensuring monetary calculations are correct across different currencies.
- **Reference Generation**: Verifying that unique identifiers are correctly formatted.
- **Routing Logic**: Testing that the router correctly filters and prioritizes providers based on input parameters.
- **Fallback Orchestration**: Crucial tests ensuring that if Provider A fails, Provider B is tried seamlessly.

## Integration Tests (Planned)

Located in `tests/integration/`, these tests verify the interaction between services and the database.
They require a running test database.

## E2E / Provider Tests (Planned)

Verification using Sandbox/Test environments of real providers (Stripe, CinetPay).
