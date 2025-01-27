import { HTTPStatus } from "../src/lib/consts.js";
import { RequestAdapter } from "../src/lib/request-adapter.js";
import { RequestOptions } from "../src/lib/request-options.js";
import { RequestResponseInput } from "../src/lib/request.types.js";

export const ROUTE_OK = "ok";
export const ROUTE_NOT_FOUND = "not-found";
export const ROUTE_UNKNOWN = "unknown";

export class TestRequestAdapter extends RequestAdapter {
    public constructor() {
        super({});
    }

    protected override executeRequest(
        route: string,
        options: RequestOptions
    ): Promise<RequestResponseInput> {
        switch (route) {
            case ROUTE_OK:
                return Promise.resolve({
                    status: HTTPStatus.OK,
                    body: options.body ?? "ok",
                    headers: Iterator.from(options.headers).map(([k, v]) => [
                        k,
                        v,
                    ]),
                    route,
                });
            case ROUTE_NOT_FOUND:
                return Promise.resolve({
                    status: HTTPStatus.NOT_FOUND,
                    body: "not found",
                    headers: [],
                    route,
                });
            case ROUTE_UNKNOWN:
                return Promise.resolve({
                    status: 999,
                    body: "unknown",
                    headers: [],
                    route,
                });
            default:
                return Promise.resolve({
                    status: HTTPStatus.INTERNAL_SERVER_ERROR,
                    body: "default",
                    headers: [],
                    route,
                });
        }
    }
}
