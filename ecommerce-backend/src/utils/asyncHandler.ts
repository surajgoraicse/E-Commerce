import { Request, Response, NextFunction } from "express";

import { ControllerType } from "../types/types.js";

export const asyncHandler =
	(fn: ControllerType) => (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
