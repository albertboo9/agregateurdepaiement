import crypto from "crypto";
import { PaymentProviderInterface } from "../base/provider.interface.js";
import { PaymentStatus } from "../../enums/index.js";

export class KkiapayService extends PaymentProviderInterface {
  constructor(config = {}) {
    super();
    this.secretKey = config.secretKey || process.env.KKIAPAY_SECRET_KEY;
    this.privateKey = config.privateKey || process.env.KKIAPAY_PRIVATE_KEY;
    this.publicKey = config.publicKey || process.env.KKIAPAY_PUBLIC_KEY;
    this.sandbox = config.sandbox !== undefined ? config.sandbox : process.env.KKIAPAY_SANDBOX === "true";
  }

  /**
   * Create payment parameters for KKiaPay widget
   * KKiaPay is primarily client-side, so we return widget parameters
   */
  async createPayment(paymentData) {
    if (!this.publicKey) {
      return { success: false, error: "Kkiapay public key not configured" };
    }

    try {
      // Generate unique reference
      const reference = paymentData.transactionNumber || this.generateReference();

      // Build KKiaPay widget parameters
      const widgetParams = {
        amount: Math.round(paymentData.amount),
        sandbox: this.sandbox,
        key: this.publicKey,
        phone: paymentData.customerPhoneNumber || "",
        email: paymentData.customerEmail || "",
        name: paymentData.customerName || "Customer",
        surname: paymentData.customerSurname || "User",
        reference: reference,
        callback_url: paymentData.successUrl,
        return_url: paymentData.successUrl,
        cancel_url: paymentData.cancelUrl,
        metadata: {
          orderId: paymentData.orderId,
          paymentIntentId: paymentData.paymentIntentId,
          transactionNumber: reference,
        },
      };

      console.log("[KkiapayService] Created payment params with reference:", reference);

      // Return widget parameters - frontend will open KKiaPay widget
      return {
        success: true,
        transactionNumber: reference,
        redirectUrl: null, // KKiaPay uses widget, not redirect
        widgetParams: widgetParams,
        status: PaymentStatus.REQUIRES_ACTION,
        response: { message: "Use widgetParams to open KKiaPay widget" },
      };
    } catch (error) {
      console.error("[KkiapayService] Error creating payment:", error);
      return {
        success: false,
        errorCode: "KKIAPAY_ERROR",
        errorMessage: error.message,
      };
    }
  }

  /**
   * Verify transaction status using KKiaPay SDK
   * Note: This requires @kkiapay-org/nodejs-sdk to be installed
   */
  async checkStatus(transactionNumber) {
    if (!this.privateKey || !this.publicKey || !this.secretKey) {
      console.warn("[KkiapayService] Missing KKiaPay keys for verification");
      return { success: false, error: "KKiaPay keys not configured for verification" };
    }

    try {
      // Try to import KKiaPay SDK dynamically
      let kkiapay;
      try {
        kkiapay = await import("@kkiapay-org/nodejs-sdk");
      } catch (e) {
        console.warn("[KkiapayService] KKiaPay SDK not installed. Install with: npm install @kkiapay-org/nodejs-sdk");
        return { success: false, error: "KKiaPay SDK not installed" };
      }

      const k = kkiapay.kkiapay({
        privatekey: this.privateKey,
        publickey: this.publicKey,
        secretkey: this.secretKey,
        sandbox: this.sandbox,
      });

      const response = await k.verify(transactionNumber);

      return {
        success: true,
        status: this.mapStatus(response?.status || response?.state),
        response: response,
      };
    } catch (error) {
      console.error("[KkiapayService] Error checking status:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Refund a transaction
   */
  async refund(transactionNumber, amount = null) {
    if (!this.privateKey || !this.publicKey || !this.secretKey) {
      return { success: false, error: "KKiaPay keys not configured" };
    }

    try {
      let kkiapay;
      try {
        kkiapay = await import("@kkiapay-org/nodejs-sdk");
      } catch (e) {
        return { success: false, error: "KKiaPay SDK not installed" };
      }

      const k = kkiapay.kkiapay({
        privatekey: this.privateKey,
        publickey: this.publicKey,
        secretkey: this.secretKey,
        sandbox: this.sandbox,
      });

      const response = await k.refund(transactionNumber);

      return {
        success: true,
        response: response,
      };
    } catch (error) {
      console.error("[KkiapayService] Error refunding:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload, signature) {
    if (!signature || !this.privateKey) {
      return false;
    }

    try {
      // KKiaPay webhook signature verification
      const expectedSignature = crypto
        .createHmac("sha256", this.privateKey)
        .update(JSON.stringify(payload))
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      console.error("[KkiapayService] Signature validation error:", error);
      return false;
    }
  }

  /**
   * Map KKiaPay status to internal status
   */
  mapStatus(providerStatus) {
    if (!providerStatus) return PaymentStatus.FAILED;

    const status = String(providerStatus).toLowerCase();

    // KKiaPay status mapping
    if (status === "success" || status === "completed" || status === "successful") {
      return PaymentStatus.SUCCEEDED;
    }
    if (status === "pending" || status === "processing" || status === "waiting") {
      return PaymentStatus.PROCESSING;
    }
    if (status === "failed" || status === "failed" || status === "expired") {
      return PaymentStatus.FAILED;
    }
    if (status === "canceled" || status === "cancelled") {
      return PaymentStatus.CANCELED;
    }

    return PaymentStatus.FAILED;
  }

  /**
   * Generate unique reference
   */
  generateReference() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `KKIAPAY-${timestamp}-${random}`.toUpperCase();
  }
}
