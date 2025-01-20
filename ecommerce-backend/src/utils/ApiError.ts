class ApiError extends Error {
	data: Record<string, any> | null = null;
	success = false;

	constructor(
		public statusCode: number,
		public message: string = "something went wrong",
		public errors: Error | string | string[] = []
	) {
		super(message);

		// capture stack trace if not already set
		if (!this.stack) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export default ApiError;
