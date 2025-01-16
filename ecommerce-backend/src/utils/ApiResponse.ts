
class ApiResponse {
	constructor(
		public statusCode: number,
		public message: string,
		public data: any
	) {
		success: true;
	}
}
export default ApiResponse