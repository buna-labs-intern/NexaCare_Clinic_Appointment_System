import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import AppError from "../utils/AppError";
import logger from "../config/logger";

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let errorMessages: { path: string; message: string }[] = [];

    logger.error({
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        message: err.message,
        stack: err.stack,
    });

    if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation Error";

        errorMessages = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }));
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;

        switch (err.code) {
            case "P2002":
                message = "Duplicate value. This record already exists.";
                break;

            case "P2025":
                message = "Requested resource not found.";
                break;

            case "P2003":
                message = "Foreign key constraint failed.";
                break;

            default:
                message = err.message;
        }
    }

    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Database validation failed.";

        errorMessages = [
            {
                path: "database",
                message: err.message,
            },
        ];
    }

    else if (err instanceof Error) {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default globalErrorHandler;