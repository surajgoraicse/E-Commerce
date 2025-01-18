import { Request, Response, NextFunction } from "express";
export interface NewUserRequestBody {
	_id: string;
	name: string;
	email: string;
	gender: string;
	dob: Date;
	photo: string;
}
export interface NewProductRequestBody {
	name: string;
	category: string;
	price: number;
	stock: number;
}

export type ControllerType = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<any>;

export type SearchRequestQuery = {
	search?: string;
	price?: string;
	category?: string;
	sort?: string;
	page?: string;
}

export interface BaseQueryType{
	name? : {
		$regex: string | undefined;
		$options: string;
	},
	price?: {
			$lte: number;
	},
	category?: string | undefined
}