import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller.js";
import { catchAsync } from "../middlewares/error.middleware.js";

const router = Router();

router.post("/cinetpay", catchAsync(WebhookController.cinetpay));
router.post("/stripe", catchAsync(WebhookController.stripe));

export default router;
