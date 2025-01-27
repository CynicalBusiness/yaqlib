import {
    defer,
    firstValueFrom,
    map,
    Observable,
    ObservableInput,
    shareReplay,
    tap,
} from "rxjs";
import { RequestError } from "./request-error.js";
import { RequestOptions } from "./request-options.js";
import { RequestResponse } from "./request-response.js";
import { RequestOptionsInput, RequestResponseInput } from "./request.types.js";

export interface RequestAdapterOptions {
    /**
     * Default request options to be used for all requests.
     */
    defaults?: RequestOptions<never>;
}

/**
 * Adapter which actually executes requests.
 *
 * This is an abstract base class which should be extended to implement the actual request execution logic, such as
 * `@yaqlib/fetch`'s `FetchRequestAdapter`.
 */
export abstract class RequestAdapter<
    TOptions extends RequestAdapterOptions = RequestAdapterOptions
> {
    /**
     * @param options Options for the query adapter
     */
    public constructor(public readonly options: TOptions) {}

    public get defaultRequestOptions(): RequestOptions<never> {
        return this.options.defaults ?? RequestOptions.default;
    }

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
    public request<T>(
        route: string,
        optionsInput?: RequestOptionsInput<T>
    ): Observable<RequestResponse<unknown, T>> {
        const options = this.defaultRequestOptions.extend(optionsInput);
        return defer(() => this.executeRequest(route, options)).pipe(
            map((response) => new RequestResponse(response, options)),
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
