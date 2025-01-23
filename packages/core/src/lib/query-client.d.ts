import { RequestAdapter } from "./request-adapter.js";
/**
 * Query client used to execute queries.
 *
 * May be used by itself, but is most powerful when subclassed by a custom client class.
 */
export declare class QueryClient<TAdapter extends RequestAdapter> {
    readonly adapter: TAdapter;
    /**
     * @param adapter The query adapter to use for executing queries.
     */
    constructor(adapter: TAdapter);
}
