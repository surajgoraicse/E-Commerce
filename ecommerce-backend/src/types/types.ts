import { Request, Response, NextFunction } from "express";
export interface NewUserRequestBody {
	_id: string;
	name: string;
	email: string;
	gender: string;
	dob: Date;
	photo: string;
}

export type ControllerHandler = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<any>;
