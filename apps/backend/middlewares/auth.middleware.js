import { ApiKeyService } from "../services/api-key.service.js";
import { UnauthorizedError } from "../utils/errors.js";
import { catchAsync } from "./error.middleware.js";

/**
 * Middleware to check for valid API Key
 */
export const protect = catchAsync(async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];

    if (!apiKey) {
        throw new UnauthorizedError("App identification failed: Missing API Key");
    }

    const isValid = await ApiKeyService.validate(apiKey);

    if (!isValid) {
        throw new UnauthorizedError("App identification failed: Invalid API Key");
    }

    next();
});
