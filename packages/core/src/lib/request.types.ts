import { HTTPMethod } from "./consts.js";
import { RequestOptions } from "./request-options.js";

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

export type StatusPredicate = number | ((status: number) => boolean);

export type RequestHeaderEntryInput = [
    string | number | undefined,
    options?: RequestHeaderOptions
];

export type RequestHeaderInput =
    | Record<
          string | number,
          string | number | RequestHeaderEntryInput | undefined
      >
    | Iterable<
          | [string | number, ...RequestHeaderEntryInput]
          | [
                string | number,
                string | number | RequestHeaderEntryInput | undefined
            ]
          | Record<
                string | number,
                string | number | RequestHeaderEntryInput | undefined
            >
      >;

export interface RequestOptionsInput<TBody = unknown>
    extends Partial<
        Pick<
            RequestOptions<TBody>,
            "body" | "allowedStatues" | "onlyAllowedStatuses"
        >
    > {
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

export interface RequestResponseInput<TBody = unknown> {
    status: number;
    body: TBody;
    route: string;
    headers?: RequestHeaderInput;
}
