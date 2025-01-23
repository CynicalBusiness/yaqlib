import { RequestAdapter } from "./request-adapter.js";

/**
 * Query client used to execute queries.
 *
 * May be used by itself, but is most powerful when subclassed by a custom client class.
 */
export class QueryClient<TAdapter extends RequestAdapter> {
    /**
     * @param adapter The query adapter to use for executing queries.
     */
    public constructor(public readonly adapter: TAdapter) {}
}
