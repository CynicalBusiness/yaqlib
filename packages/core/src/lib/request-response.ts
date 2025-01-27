import { HTTPStatus } from "./consts.js";
import { HeaderCollection } from "./header-collection.js";
import { RequestOptions } from "./request-options.js";
import { RequestResponseInput } from "./request.types.js";

export class RequestResponse<TBody = unknown, TReqBody = unknown> {
    /**
     * Status code of the response.
     */
    public readonly status: number;

    /**
     * Status text of the response.
     *
     * For most adapters, this will be HTTP status texts.
     */
    public readonly statusText: string;

    /**
     * Response body
     */
    public readonly body: TBody;

    /**
     * Whether or not the response was considered "successful", which varies depending on the adapter and its settings.
     */
    public readonly success: boolean;

    /**
     * Headers of the response.
     */
    public readonly headers: HeaderCollection;

    /**
     * The route that was used for the request.
     */
    public readonly route: string;

    /**
     * Options passed to the original request.
     */
    public readonly request: RequestOptions<TReqBody>;

    public constructor(
        input: RequestResponseInput<TBody>,
        request: RequestOptions<TReqBody> = RequestOptions.default
    ) {
        this.status = input.status;
        this.statusText =
            input.status in HTTPStatus ? HTTPStatus[input.status] : "UNKNOWN";
        this.body = input.body;
        this.success = request.isStatusAllowed(input.status);
        this.headers = new HeaderCollection(input.headers);
        this.route = input.route;
        this.request = request;
    }
}
