import { map } from "rxjs";
import { RequestAdapter } from "./request-adapter.js";
import { RequestResponse } from "./request-response.js";
import { RequestOptionsInput } from "./request.types.js";

/**
 * Query client used to execute queries.
 *
 * May be used by itself, but is most powerful when subclassed by a custom client class.
 */
export class RequestClient {
    /**
     * @param adapter The query adapter to use for executing queries.
     */
    public constructor(public readonly adapter: RequestAdapter) {}

    /**
     * Initiates a request to the given {@link route} using the client's adapter, or the given {@link adapter} if provided.
     *
     * @param route The route to request
     * @param options The options for the request
     * @param adapter The adapter to use for the request
     * @returns
     */
    public request<TBody = never, TReqBody = unknown>(
        route: string,
        options?: RequestOptionsInput<TReqBody> & {
            mapBody?: (
                body: unknown,
                response: RequestResponse<unknown, TReqBody>
            ) => TBody;
        },

        adapter: RequestAdapter = this.adapter
    ) {
        return adapter.request(route, options).pipe(
            map((res) => {
                const body = options?.mapBody?.(res.body, res);
                Object.defineProperty(res, "body", {
                    value: body,
                    enumerable: true,
                });
                return res as RequestResponse<TBody, TReqBody>;
            })
        );
    }

    /**
     * Defines a route function which, when invoked, will initiate a request to the given {@link route} by passing
     * any arguments to the given {@link requestSelector} to generate the request options, and then passing the
     * response to the given {@link resultSelector} to generate the result body.
     *
     * The request will be made using the client's adapter, unless {@link adapter} is provided.
     *
     * @param route The route to request
     * @param options Options for the route
     * @param options.request A function which, when invoked, will generate the request options
     * @param options.result A function which, when invoked, will generate the result body
     * @param options.adapter The adapter to use for the request
     * @returns A function which, when invoked, will initiate the request
     */
    public defineRoute<
        TArgs extends unknown[] = [],
        TBody = never,
        TReqBody = never
    >(
        route: string,
        options?: {
            request?: (
                ...args: TArgs
            ) => RequestOptionsInput<TReqBody> | undefined;
            result?: (
                body: unknown,
                response: RequestResponse<unknown, TReqBody>
            ) => TBody;
            adapter?: RequestAdapter;
        }
    ) {
        return (...args: TArgs) =>
            this.request(
                route,
                {
                    ...options?.request?.(...args),
                    mapBody: options?.result,
                },
                options?.adapter
            );
    }
}
