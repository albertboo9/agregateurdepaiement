import { HttpStatus } from "../enums/index.js";

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const status = err.status || "error";

    console.error(`[Error] ${statusCode} - ${err.message}`);
    if (err.stack) console.error(err.stack);

    res.status(statusCode).json({
        status: status,
        message: err.message,
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
