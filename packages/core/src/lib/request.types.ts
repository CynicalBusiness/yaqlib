import { HTTPMethod } from "./consts.js";

export interface RequestHeaderOptions {
    /**
     * By default (or if set to `false`) and this header is already set, it will be overwritten.
     *
     * If set to `true`, the header will be appended to the existing headers anyway and the header may appear multiple times.
     */
    append?: boolean;
}

export type RequestHeaderValue = [
    value: string,
    options?: RequestHeaderOptions
];
export type RequestHeaderEntry = [header: string, ...RequestHeaderValue];

export interface RequestOptions {
    /**
     * The method to use for the request.
     */
    method: HTTPMethod | string;

    /**
     * Additional headers to pass
     */
    headers: Iterable<RequestHeaderEntry>;

    /**
     * An optional body to pass as part of the request.
     */
    body?: unknown;

    /**
     * Additional statuses to consider as "successful" responses.
     *
     * For example, a `404 NOT_FOUND` might be considered successful in some cases.
     */
    allowedStatues?: readonly number[];

    /**
     * If set to `true`, *only* statuses in `allowStatuses` will be considered successful, instead of all 200-299
     * statuses along with them.
     */
    onlyAllowedStatuses?: boolean;
}

export type RequestHeaderEntryInput = [
    string | number,
    options?: RequestHeaderOptions
];

export type RequestHeaderInput =
    | Record<string | number, string | number | RequestHeaderEntryInput>
    | Iterable<
          | [string | number, ...RequestHeaderEntryInput]
          | [string | number, string | number | RequestHeaderEntryInput]
      >;

export interface RequestOptionsInput
    extends Omit<RequestOptions, "headers" | "method"> {
    /**
     * The method to use for the request. Defaults to `GET`.
     */
    method?: HTTPMethod | string;

    /**
     * Additional headers to pass
     */
    headers?: RequestHeaderInput;

    /**
     * Alias for setting the `Content-Type` header.
     */
    contentType?: string;
}

export interface RequestResponse<TBody = unknown> {
    /**
     * Status code of the response.
     */
    status: number;

    /**
     * Status text of the response.
     *
     * For most adapters, this will be HTTP status texts.
     */
    statusText: string;

    /**
     * Response body
     */
    body: TBody;

    /**
     * Whether or not the response was considered "successful", which varies depending on the adapter and its settings.
     */
    success: boolean;

    /**
     * Headers of the response.
     */
    headers: Iterable<[header: string, value: string]>;

    /**
     * Headers of the response, as an object.
     */
    headersObject: Record<string, readonly [string, ...string[]]>;

    /**
     * Information about the request that was made.
     */
    request: {
        /** The route that was requested */
        route: string;

        /** The actual full URL that was requested */
        url: string;

        /** The options passed to the request */
        options: RequestOptions;
    };
}

export type RequestResponseInput<TBody = unknown> = Omit<
    RequestResponse<TBody>,
    "headersObject" | "success" | "request" | "statusText"
> &
    Partial<Pick<RequestResponse<TBody>, "statusText">> & { url: string };
