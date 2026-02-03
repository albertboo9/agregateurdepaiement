import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export class InstallmentPayment extends Model { }

InstallmentPayment.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        planId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        paymentIntentId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },
        installmentNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "paid", "failed", "waived"),
            defaultValue: "pending",
        },
        paidAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "InstallmentPayment",
        tableName: "aggp_installment_payments",
        underscored: true,
    }
);
