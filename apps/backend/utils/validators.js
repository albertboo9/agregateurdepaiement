import { z } from "zod";

export const initPaymentSchema = z.object({
    customerEmail: z.string().email(),
    customerName: z.string().optional(),
    currency: z.string().min(3).max(10),
    amount: z.number().positive(),
    paymentMethod: z.enum(["card", "mobile_money"]),
    countryCode: z.string().length(2),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    notifyUrl: z.string().url().optional(),
    idempotencyKey: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export const paymentStatusSchema = z.object({
    id: z.string(),
});
