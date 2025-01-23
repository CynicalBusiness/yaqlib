import {
    defer,
    map,
    Observable,
    ObservableInput,
    shareReplay,
    tap,
} from "rxjs";
import { HTTPMethod, HTTPStatus } from "./consts.js";
import { RequestError } from "./request-error.js";
import {
    RequestHeaderEntry,
    RequestHeaderValue,
    RequestOptions,
    RequestOptionsInput,
    RequestResponse,
    RequestResponseInput,
} from "./request.types.js";

export interface RequestAdapterOptions {
    /**
     * The base URL to use for all requests.
     *
     * If not given, the default base URL of the chosen adapter will be used.
     */
    baseUrl?: string | URL;

    /**
     * Default request options to be used for all requests.
     */
    defaults?: RequestOptionsInput;
}

/**
 * Adapter which actually executes requests.
 *
 * This is an abstract base class which should be extended to implement the actual request execution logic, such as
 * `@yaqlib/fetch`'s `FetchRequestAdapter`.
 */
export abstract class RequestAdapter {
    /**
     * Normalizes the input headers object into a single consistent format: an iterable of [key, value, options?] tuples.
     * @param headers The headers to normalize
     * @returns The normalized headers
     */
    public static *normalizeHeaders(
        headers: RequestOptionsInput["headers"]
    ): Generator<RequestHeaderEntry> {
        if (!headers) return;

        if (Symbol.iterator in headers) {
            for (const headerEntry of headers) {
                if (Array.isArray(headerEntry)) {
                    yield headerEntry;
                } else {
                    yield* this.normalizeHeaderRecord(headerEntry);
                }
            }
        } else {
            yield* this.normalizeHeaderRecord(headers);
        }
    }

    private static *normalizeHeaderRecord(
        input: Record<string, string | RequestHeaderValue>
    ): Generator<RequestHeaderEntry> {
        for (const [header, value] of Object.entries(input)) {
            yield typeof value === "string"
                ? [header, value]
                : [header, ...value];
        }
    }

    /**
     * @param options Options for the query adapter
     */
    public constructor(public readonly options: RequestAdapterOptions = {}) {}

    /**
     * Initiate a request using this adapter's request engine.
     *
     * The result will be an observable will be deferred and shared, and have its last value replayed. In effect, this
     * means that the request will only be made once, but not until first subscribed, and the result will be cached for
     * future subscribers.
     *
     * @param route The route to request
     * @param options The request to perform
     * @returns The response of the request, as an observable.
     */
    public request(
        route: string,
        optionsInput: RequestOptionsInput
    ): Observable<RequestResponse> {
        const options = this.normalizeRequestOptions(optionsInput);
        return defer(() => this.executeRequest(route, options)).pipe(
            map((response) =>
                this.normalizeResponse(response, { route, options })
            ),
            tap((response) => {
                // this makes sure that each subscriber will always get the error
                if (!response.success) {
                    throw new RequestError(response);
                }
            }),
            shareReplay(1)
        );
    }

    protected isStatusAllowed(
        status: number,
        options: RequestOptions
    ): boolean {
        return (
            (options.allowedStatues?.length &&
                options.allowedStatues.includes(status)) ||
            (!options.onlyAllowedStatuses && status >= 200 && status < 300)
        );
    }

    protected getStatusText(status: number): string {
        return status in HTTPStatus ? HTTPStatus[status] : "UNKNOWN";
    }

    /**
     * Normalizes request options input into a consistent format, merging with defaults.
     * @param options The options to normalize
     * @returns The normalized options
     */
    protected normalizeRequestOptions(
        options: RequestOptionsInput
    ): RequestOptions {
        const { headers, allowedStatues, contentType, ...rest } = options;
        const {
            headers: defaultHeaders,
            allowedStatues: defaultAllowedStatuses,
            contentType: defaultContentType,
            ...defaults
        } = this.options.defaults ?? {};

        const normalizeHeaders = [
            ...RequestAdapter.normalizeHeaders(defaultHeaders),
            ...RequestAdapter.normalizeHeaders(headers),
        ];

        const contentTypeHeader = contentType ?? defaultContentType;
        if (contentTypeHeader) {
            normalizeHeaders.unshift(["Content-Type", contentTypeHeader]);
        }

        return {
            method: HTTPMethod.GET,
            ...defaults,
            ...rest,
            headers: normalizeHeaders,
            allowedStatues: [
                ...(defaultAllowedStatuses ?? []),
                ...(allowedStatues ?? []),
            ],
        };
    }

    protected normalizeResponse<TBody>(
        { url, ...response }: RequestResponseInput<TBody>,
        request: Omit<RequestResponse["request"], "url">
    ): RequestResponse<TBody> {
        return {
            ...response,
            statusText: this.getStatusText(response.status),
            success: this.isStatusAllowed(response.status, request.options),
            headersObject: Iterator.from(response.headers).reduce((o, next) => {
                const prev = o[next[0]];
                o[next[0]] = prev?.length ? [...prev, next[1]] : [next[1]];
                return o;
            }, {} as RequestResponse["headersObject"]),
            request: {
                ...request,
                url,
            },
        };
    }

    /**
     * Actually executes the request. Options are already normalized and the resulting response will be normalized
     *  before being returned.
     *
     * Note: any observable input is accepted and will be automatically converted to a *deferred* observable.
     *
     * @param route The route to request
     * @param options The options to use for the request
     * @returns The response of the request
     */
    protected abstract executeRequest(
        route: string,
        options: RequestOptions
    ): ObservableInput<RequestResponseInput>;
}
