import { Observable, ObservableInput } from "rxjs";
import { RequestHeaderEntry, RequestOptions, RequestOptionsInput, RequestResponse, RequestResponseInput } from "./request.types.js";
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
export declare abstract class RequestAdapter {
    readonly options: RequestAdapterOptions;
    /**
     * Normalizes the input headers object into a single consistent format: an iterable of [key, value, options?] tuples.
     * @param headers The headers to normalize
     * @returns The normalized headers
     */
    static normalizeHeaders(headers: RequestOptionsInput["headers"]): Generator<RequestHeaderEntry>;
    private static normalizeHeaderRecord;
    /**
     * @param options Options for the query adapter
     */
    constructor(options?: RequestAdapterOptions);
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
    request(route: string, optionsInput: RequestOptionsInput): Observable<RequestResponse>;
    protected isStatusAllowed(status: number, options: RequestOptions): boolean;
    protected getStatusText(status: number): string;
    /**
     * Normalizes request options input into a consistent format, merging with defaults.
     * @param options The options to normalize
     * @returns The normalized options
     */
    protected normalizeRequestOptions(options: RequestOptionsInput): RequestOptions;
    protected normalizeResponse<TBody>({ url, ...response }: RequestResponseInput<TBody>, request: Omit<RequestResponse["request"], "url">): RequestResponse<TBody>;
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
    protected abstract executeRequest(route: string, options: RequestOptions): ObservableInput<RequestResponseInput>;
}
