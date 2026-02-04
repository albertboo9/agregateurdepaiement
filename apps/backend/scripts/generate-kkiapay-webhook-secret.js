/**
 * KKiaPay Webhook Secret Generator
 * Ce script génère un secret sécurisé pour valider les webhooks KKiaPay
 *
 * Instructions:
 * 1. Exécuter ce script: node generate-kkiapay-webhook-secret.js
 * 2. Copier le secret généré
 * 3. Le fournir à KKiaPay dans leur dashboard
 * 4. L'ajouter dans .env: KKIAPAY_WEBHOOK_SECRET=secret_généré
 */

import crypto from "crypto";

// Configuration
const ALGORITHM = "sha256";
const OUTPUT_ENCODING = "hex";

/**
 * Génère un secret webhook sécurisé
 */
function generateWebhookSecret(length = 64) {
  // Génère des bytes aléatoires sécurisés
  const bytes = crypto.randomBytes(length);
  return bytes.toString(OUTPUT_ENCODING);
}

/**
 * Génère un hash pour un payload webhook (pour tests)
 */
function generateSignature(payload, webhookSecret) {
  return crypto
    .createHmac(ALGORITHM, webhookSecret)
    .update(JSON.stringify(payload))
    .digest(OUTPUT_ENCODING);
}

/**
 * Valide une signature webhook
 */
function validateSignature(payload, signature, webhookSecret) {
  const expectedSignature = generateSignature(payload, webhookSecret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

// === Exécution du script ===
console.log("=".repeat(60));
console.log("  Générateur de Secret Webhook KKiaPay");
console.log("=".repeat(60));
console.log();

// Générer le secret
const webhookSecret = generateWebhookSecret(64);

console.log("🔐 Secret Webhook KKiaPay généré:");
console.log();
console.log("  " + "─".repeat(58));
console.log("  " + webhookSecret);
console.log("  " + "─".repeat(58));
console.log();

// Instructions d'utilisation
console.log("📋 Instructions:");
console.log();
console.log("1. Copie ce secret et fournis-le à KKiaPay:");
console.log("   → Va dans ton dashboard KKiaPay");
console.log("   → Cherche la section 'Développeurs' ou 'Webhooks'");
console.log("   → Ajoute ce secret comme 'Webhook Secret'");
console.log();
console.log("2. Ajoute ce secret dans ton fichier .env:");
console.log(`   KKIAPAY_WEBHOOK_SECRET=${webhookSecret}`);
console.log();

// Exemple de validation (pour tests)
const testPayload = {
  event_type: "payment.success",
  reference: "KKIAPAY-TEST-123",
  amount: 1000,
  status: "success",
};

const testSignature = generateSignature(testPayload, webhookSecret);
console.log("🧪 Test de validation:");
console.log();
console.log("Payload:", JSON.stringify(testPayload));
console.log("Signature:", testSignature);
console.log(
  "Validation:",
  validateSignature(testPayload, testSignature, webhookSecret)
    ? "✅ Valide"
    : "❌ Invalide",
);
console.log();

// Fin
console.log("=".repeat(60));
console.log("  IMPORTANT: Conserve ce secret en lieu sûr!");
console.log("=".repeat(60));

// Exporter pour utilisation dans d'autres modules
export { generateWebhookSecret, generateSignature, validateSignature };
