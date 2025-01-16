class ApiResponse {
	success = true;
	constructor(
		public statusCode: number,
		public message: string,
		public data: any
	) {}
}
export default ApiResponse;
