import { HTTPMethod } from "./consts.js";
import { HeaderCollection } from "./header-collection.js";
import { RequestOptionsInput, StatusPredicate } from "./request.types.js";

export class RequestOptions<TBody = unknown> {
    public static readonly default = new RequestOptions<never>();

    /**
     * Status predicate that allows any status code in the 2xx range.
     */
    public static readonly allow200Statuses: StatusPredicate = (s) =>
        s >= 200 && s < 300;

    /**
     * Status predicate that allows any status code in the 4xx range.
     */
    public static readonly allow400Statuses: StatusPredicate = (s) =>
        s >= 400 && s < 500;

    /**
     * Status predicate that allows any status code.
     */
    public static readonly allowAnyStatus: StatusPredicate = () => true;

    /**
     * The method to use for the request.
     */
    public readonly method: HTTPMethod | string;

    /**
     * Additional headers to pass
     */
    public readonly headers: HeaderCollection;

    /**
     * An optional body to pass as part of the request.
     */
    public readonly body?: TBody;

    /**
     * Additional statuses to consider as "successful" responses.
     *
     * For example, a `404 NOT_FOUND` might be considered successful in some cases.
     */
    public readonly allowedStatues: StatusPredicate[];

    /**
     * If `true`, only statuses in `allowedStatuses` will be considered successful.
     *
     * If `false` (or not set), any status code in the 2xx range will also be considered successful (as well as any in
     * `allowedStatuses`).
     */
    public readonly onlyAllowedStatuses?: boolean;

    public constructor(options: RequestOptionsInput<TBody> = {}) {
        this.method = options.method ?? HTTPMethod.GET;
        this.body = options.body;
        this.allowedStatues = options.allowedStatues ?? [];
        this.onlyAllowedStatuses = options.onlyAllowedStatuses;

        this.headers = new HeaderCollection(options.headers, {
            "Content-Type": options.contentType,
        });
    }

    /**
     * Extends this options object with the given input, creating a new object with the merged values.
     *
     * @param input The options to extend with
     * @returns The new options object
     */
    public extend<T>(input: RequestOptionsInput<T> = {}): RequestOptions<T> {
        const { headers, allowedStatues, body, contentType, ...rest } = input;

        return new RequestOptions({
            ...this,
            ...rest,
            body,
            allowedStatues: [...this.allowedStatues, ...(allowedStatues ?? [])],
            headers: this.headers.extend(headers, {
                "Content-Type": contentType,
            }),
        });
    }

    /**
     * Checks whether the given status code is allowed (i.e. considered "successful") by these options.
     *
     * @param status The status code to check
     * @returns `true` if the status is considered successful, `false` otherwise
     */
    public isStatusAllowed(status: number) {
        return this.getStatusPredicates().some((s) => {
            switch (typeof s) {
                case "number":
                    return s === status;
                case "function":
                    return s(status);
                default:
                    return false;
            }
        });
    }

    private *getStatusPredicates(): Generator<StatusPredicate> {
        if (!this.onlyAllowedStatuses) {
            yield RequestOptions.allow200Statuses;
        }
        yield* this.allowedStatues;
    }
}
