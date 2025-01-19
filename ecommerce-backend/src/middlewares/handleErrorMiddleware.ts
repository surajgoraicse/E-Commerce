import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const handleErrorMiddleware = (
	err: ApiError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errorResponse = {
		statusCode: err.statusCode || 500,
		data: err.data || null,
		errors: err.errors || [],
		success: err.success || false,
		message: err.message || "Something went wrong",
	};

	// Include stack trace in development mode
	//  if (process.env.NODE_ENV === "development") {
	//     errorResponse.stack = err.stack;
	// }

	// Log the error
	console.error("Error occurred:", errorResponse);
	// console.error("Error stack:", err?.stack);

	// Send the response
	res.status(errorResponse.statusCode).json(errorResponse);
};

export default handleErrorMiddleware;
