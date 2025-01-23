import { RequestResponse } from "./request.types.js";
export declare class RequestError extends Error {
    readonly response: RequestResponse;
    constructor(response: RequestResponse, options?: ErrorOptions);
}
