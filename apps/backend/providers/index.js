import { StripeService } from "./stripe/stripe.service.js";
import { CinetPayService } from "./cinetpay/cinetpay.service.js";
import { KkiapayService } from "./kkiapay/kkiapay.service.js";
import { ProviderCode } from "../enums/index.js";

export class ProviderFactory {
  /**
   * Get provider instance by code
   * @param {string} code
   * @param {Object} config
   * @returns {PaymentProviderInterface}
   */
  static getProvider(code, config = {}) {
    switch (code.toLowerCase()) {
      case ProviderCode.STRIPE:
        return new StripeService(config);
      case ProviderCode.CINETPAY:
        return new CinetPayService(config);
      case ProviderCode.KKIAPAY:
        return new KkiapayService(config);
      // case ProviderCode.MAVIANCE:
      //   return new MavianceService(config);
      default:
        throw new Error(
          `Provider ${code} not supported or not implemented yet`,
        );
    }
  }
}
