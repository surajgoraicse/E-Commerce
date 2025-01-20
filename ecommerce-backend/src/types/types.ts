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
};

export interface BaseQueryType {
	name?: {
		$regex: string | undefined;
		$options: string;
	};
	price?: {
		$lte: number;
	};
	category?: string | undefined;
}

export type InvalidateCacheProps = {
	product?: boolean;
	order?: boolean;
	admin?: boolean;
	userId?: string;
	orderId?: string
};

export type shippingInfoType = {
	address: string,
	city: string,
	state : string,
	country : string,
	pincode : number,
};
export type orderItemsType = {
	name: string;
	photo: string;
	price: number;
	quantity: number;
	productId: string
};

export interface NewOrderRequestBody {
	shippingInfo: shippingInfoType;
	user: string;
	subTotal: string;
	tax: number;
	shippingCharges: number;
	discount: number;
	total: number;
	status: string;
	orderItems: orderItemsType[];
}
