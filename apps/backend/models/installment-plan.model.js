import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export class InstallmentPlan extends Model { }

InstallmentPlan.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        numberOfInstallments: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        intervalDays: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
        },
        status: {
            type: DataTypes.ENUM("active", "completed", "canceled", "failed"),
            defaultValue: "active",
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "InstallmentPlan",
        tableName: "aggp_installment_plans",
        underscored: true,
    }
);
