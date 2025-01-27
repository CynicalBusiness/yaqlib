import {
    defer,
    firstValueFrom,
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
    RequestHeaderInput,
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
     *
     * Accepts:
     * - An object of either a header value (as a string) or a tuple of [value, options?] for each header.
     * - An iterable of either:
     *   - An object like above
     *   - A tuple of [header, value, options?] for each header
     *
     * @param headers The headers to normalize
     * @returns The normalized headers
     */
    public static *normalizeHeaders(
        headers: RequestHeaderInput | null | undefined
    ): Generator<RequestHeaderEntry> {
        if (!headers) return;
        if (typeof headers !== "object") {
            throw new TypeError("Headers must be an object or array");
        }

        if (!(Symbol.iterator in headers)) {
            return yield* this.normalizeHeaders(Object.entries(headers));
        }

        for (let [key, entry, options] of headers) {
            if (typeof key !== "string") {
                key = String(key);
            }

            if (Array.isArray(entry)) {
                const [value, opts] = entry;
                entry = value;
                options = opts;
            }

            if (typeof entry !== "string") {
                entry = String(entry);
            }

            yield [key, entry, options];
        }
    }

    /**
     * Creates an object from the stream of headers, grouping them by header name in order of appearance.
     *
     * For example, the headers `[['a', '1'], ['b', '2'], ['a', '3']]` would be converted to
     * `{ a: ['1', '3'], b: ['2'] }`.
     *
     * @param headers The headers to convert
     * @returns The headers as an object
     */
    public static createHeaderObject<const T extends [string, string | number]>(
        headers: Iterable<T>
    ) {
        if (!(Symbol.iterator in headers)) {
            throw new TypeError("Headers must be an iterable");
        }

        return Iterator.from(headers).reduce((o, [key, value]) => {
            if (typeof value !== "string") value = String(value);
            const prev = o[key];
            o[key] = prev?.length ? [...prev, value] : [value];
            return o;
        }, {} as Record<string, readonly [string, ...string[]]>);
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
        optionsInput?: RequestOptionsInput
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

    /**
     * Immediately initiates a request and returns a promise of the response.
     *
     * This is a convenience method for calling `firstValueFrom` on the result of {@link request}.
     *
     * @param route The route to request
     * @param optionsInput The request to perform
     * @returns The response of the request, as a promise.
     */
    public requestImmediate(
        route: string,
        optionsInput?: RequestOptionsInput
    ): Promise<RequestResponse> {
        return firstValueFrom(this.request(route, optionsInput));
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
        options: RequestOptionsInput = {}
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
            headersObject: RequestAdapter.createHeaderObject(response.headers),
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
