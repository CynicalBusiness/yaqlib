import { HTTPStatus } from "./consts.js";
import { RequestAdapter } from "./request-adapter.js";
import { RequestError } from "./request-error.js";
import { RequestOptions } from "./request-options.js";
import { RequestResponseInput } from "./request.types.js";

const ROUTE_OK = "ok";
const ROUTE_NOT_FOUND = "not-found";
const ROUTE_UNKNOWN = "unknown";

class TestRequestAdapter extends RequestAdapter {
    protected override executeRequest(
        route: string,
        options: RequestOptions
    ): Promise<RequestResponseInput> {
        switch (route) {
            case ROUTE_OK:
                return Promise.resolve({
                    status: HTTPStatus.CREATED,
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

describe("class RequestAdapter", () => {
    describe("instance", () => {
        const adapter = new TestRequestAdapter({});

        describe("request", () => {
            it("should respond with successful body", async () => {
                const okResponse = await adapter.requestImmediate(ROUTE_OK);
                expect(okResponse.success).toBe(true);
                expect(typeof okResponse.body).toBe("string");
                expect(okResponse.route).toBe(ROUTE_OK);

                const json = { key: "value" };
                const jsonResponse = await adapter.requestImmediate(ROUTE_OK, {
                    body: json,
                    contentType: "application/json",
                });
                expect(jsonResponse.success).toBe(true);
                expect(typeof jsonResponse.body).toBe("object");
                expect(jsonResponse.route).toBe(ROUTE_OK);

                const notFoundResponse = await adapter.requestImmediate(
                    ROUTE_NOT_FOUND,
                    { allowedStatues: [HTTPStatus.NOT_FOUND] }
                );
                expect(notFoundResponse.success).toBe(true);
                expect(typeof notFoundResponse.body).toBe("string");

                try {
                    await adapter.requestImmediate("error");
                    fail("Expected error route to throw error");
                } catch (err) {
                    expect(err).toBeInstanceOf(RequestError);
                    const res = (err as RequestError).response;
                    expect(res.success).toBe(false);
                }

                expect(() =>
                    adapter.requestImmediate(ROUTE_UNKNOWN)
                ).rejects.toBeInstanceOf(RequestError);
            });
        });
    });
});
