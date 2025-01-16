import { Request, Response, NextFunction } from "express";

import { ControllerHandler } from "../types/types.js";

export const asyncHandler =
	(fn: ControllerHandler) => (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
