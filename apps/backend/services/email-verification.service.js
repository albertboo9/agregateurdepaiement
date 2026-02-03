import { VerifiedEmail } from "./../models/index.js";
import { MailService } from "./mail.service.js";
import { Op } from "sequelize";

export class EmailVerificationService {
    /**
     * Check if an email is already verified
     */
    static async isVerified(email) {
        if (!email) return false;

        const record = await VerifiedEmail.findOne({
            where: {
                email: email.toLowerCase(),
                isVerified: true
            }
        });

        return !!record;
    }

    /**
     * Generate a new code and send it
     */
    static async generateAndSendCode(email) {
        const emailLower = email.toLowerCase();
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const [record] = await VerifiedEmail.findOrCreate({
            where: { email: emailLower }
        });

        await record.update({
            verificationCode: code,
            codeExpiresAt: expiresAt,
            attemptsCount: 0,
            lastVerificationAttemptAt: new Date()
        });

        // Send email
        console.log(`[EmailVerificationService] Sending code ${code} to ${emailLower}`);
        await MailService.sendVerificationCode(emailLower, code);

        return {
            success: true,
            expiresAt
        };
    }

    /**
     * Verify a submitted code
     */
    static async verifyCode(email, code) {
        const emailLower = email.toLowerCase();

        const record = await VerifiedEmail.findOne({
            where: { email: emailLower }
        });

        if (!record) {
            return { success: false, message: "Email non trouvé." };
        }

        if (record.isVerified) {
            return { success: true, alreadyVerified: true };
        }

        // Check expiration
        if (record.codeExpiresAt < new Date()) {
            return { success: false, message: "Le code a expiré. Veuillez en demander un nouveau." };
        }

        // Rate limiting: 5 attempts max
        if (record.attemptsCount >= 5) {
            return { success: false, message: "Trop de tentatives. Veuillez demander un nouveau code." };
        }

        // Check code
        if (record.verificationCode !== code) {
            await record.increment('attemptsCount');
            return { success: false, message: "Code incorrect." };
        }

        // Success!
        await record.update({
            isVerified: true,
            verifiedAt: new Date(),
            verificationCode: null, // Clear code
            codeExpiresAt: null
        });

        return { success: true };
    }
}
