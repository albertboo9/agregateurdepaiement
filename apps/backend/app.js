import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./models/index.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

// Global fix for BigInt JSON serialization
BigInt.prototype.toJSON = function () {
    return this.toString();
};

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for CinetPay Webhooks

// Routes
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

// Error handling
app.use(errorHandler);

export default app;
