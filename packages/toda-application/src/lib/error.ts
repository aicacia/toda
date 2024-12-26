export class ErrorCode extends Error {
	code: string;
	attributes: Record<string, unknown>;

	constructor(code: string, attributes: Record<string, unknown>, options?: ErrorOptions) {
		super(`[${code}] ${JSON.stringify(attributes)}`, options);
		this.code = code;
		this.attributes = attributes;
	}

	static notFound(attributes: Record<string, unknown>, options?: ErrorOptions) {
		return new ErrorCode('not-found', attributes, options);
	}
}
