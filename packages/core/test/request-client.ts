import { RequestClient } from "../src/lib/request-client.js";
import { ROUTE_NOT_FOUND, ROUTE_OK } from "./request-adapter.js";

export class TestRequestClient extends RequestClient {
    public readonly getOk = this.defineRoute(ROUTE_OK);

    public getJson<T>(json: T) {
        return this.request(ROUTE_OK, {
            body: json,
            mapBody: (body) => body as T,
        });
    }

    public notFound = this.defineRoute(ROUTE_NOT_FOUND);
}
