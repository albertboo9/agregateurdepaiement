import { InstallmentPlan, InstallmentPayment, Order, sequelize } from "../models/index.js";
import { MailService } from "./mail.service.js";

export class InstallmentService {
    /**
     * Create an installment plan and generate schedule
     */
    static async createPlan(data) {
        const { orderId, totalAmount, currency, numberOfInstallments, intervalDays, metadata } = data;

        const transaction = await sequelize.transaction();

        try {
            const plan = await InstallmentPlan.create({
                orderId,
                totalAmount,
                currency,
                numberOfInstallments,
                intervalDays: intervalDays || 30,
                metadata: metadata || {}
            }, { transaction });

            const order = await Order.findByPk(orderId, { transaction });

            // Generate payments
            const payments = [];
            const installmentAmount = (totalAmount / numberOfInstallments).toFixed(2);

            for (let i = 1; i <= numberOfInstallments; i++) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (plan.intervalDays * (i - 1)));

                payments.push({
                    planId: plan.id,
                    installmentNumber: i,
                    amount: installmentAmount,
                    dueDate: dueDate,
                    status: 'pending'
                });
            }

            const createdPayments = await InstallmentPayment.bulkCreate(payments, { transaction });

            await transaction.commit();

            // Notify client
            if (order) {
                await MailService.sendInstallmentPlanConfirmation(order, plan, createdPayments);
            }

            return plan;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get all payments due for a date range
     * @param {Date} date 
     * @returns {Promise<InstallmentPayment[]>}
     */
    static async getDuePayments(date = new Date()) {
        return await InstallmentPayment.findAll({
            where: {
                dueDate: { [sequelize.Op.lte]: date },
                status: 'pending'
            },
            include: [{ model: InstallmentPlan, as: 'plan' }]
        });
    }
}
