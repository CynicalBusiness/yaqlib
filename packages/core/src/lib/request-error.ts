import { RequestResponse } from "./request.types.js";

export class RequestError extends Error {
    public constructor(
        public readonly response: RequestResponse,
        options?: ErrorOptions
    ) {
        super(
            `Request failed: ${response.status} ${response.statusText}`,
            options
        );
    }
}