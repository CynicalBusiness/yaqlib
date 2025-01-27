import { HTTPStatus } from "./consts.js";
import { RequestAdapter } from "./request-adapter.js";
import { RequestError } from "./request-error.js";
import {
    RequestHeaderInput,
    RequestOptions,
    RequestResponseInput,
} from "./request.types.js";

const BASE_URL = "http://example.com/";
const ROUTE_OK = "ok";
const ROUTE_NOT_FOUND = "not-found";
const ROUTE_UNKNOWN = "unknown";

class TestRequestAdapter extends RequestAdapter {
    protected override executeRequest(
        route: string,
        options: RequestOptions
    ): Promise<RequestResponseInput> {
        const url = (this.options.baseUrl ?? "") + route;

        switch (route) {
            case ROUTE_OK:
                return Promise.resolve({
                    status: HTTPStatus.CREATED,
                    body: options.body ?? "ok",
                    headers: Iterator.from(options.headers).map(([k, v]) => [
                        k,
                        v,
                    ]),
                    url,
                });
            case ROUTE_NOT_FOUND:
                return Promise.resolve({
                    status: HTTPStatus.NOT_FOUND,
                    body: "not found",
                    headers: [],
                    url,
                });
            case ROUTE_UNKNOWN:
                return Promise.resolve({
                    status: 999,
                    body: "unknown",
                    headers: [],
                    url,
                });
            default:
                return Promise.resolve({
                    status: HTTPStatus.INTERNAL_SERVER_ERROR,
                    body: "default",
                    headers: [],
                    url,
                });
        }
    }
}

describe("RequestAdapter", () => {
    describe("createHeaderObject", () => {
        it("should produce a grouped object of headers", () => {
            const headerObject = RequestAdapter.createHeaderObject([
                ["a", "1"],
                ["b", "2"],
                ["a", 3],
            ]);
            expect(headerObject).toEqual({
                a: ["1", "3"],
                b: ["2"],
            });
        });

        it("should reject invalid values", () => {
            expect(() =>
                RequestAdapter.createHeaderObject(
                    {} as unknown as Iterable<[string, string]>
                )
            ).toThrow(TypeError);
        });
    });

    describe("normalizeHeaders", () => {
        it("should produce a normalized header collection", () => {
            const normalizedHeaders = [
                ...RequestAdapter.normalizeHeaders(undefined),
                ...RequestAdapter.normalizeHeaders({
                    opt1: "value1",
                    opt2: ["value1"],
                }),
                ...RequestAdapter.normalizeHeaders([
                    ["opt2", "value2"],
                    ["opt1", "value2", { append: true }],
                    [3, [1]],
                ]),
            ];

            expect(normalizedHeaders).toHaveLength(5);
            expect(normalizedHeaders).toEqual([
                ["opt1", "value1"],
                ["opt2", "value1"],
                ["opt2", "value2"],
                ["opt1", "value2", { append: true }],
                ["3", "1"],
            ]);
        });

        it("should reject invalid values", () => {
            const invalidInputValue = "foo" as unknown as RequestHeaderInput;
            expect(() => [
                ...RequestAdapter.normalizeHeaders(invalidInputValue),
            ]).toThrow(TypeError);
        });
    });

    describe("<ctor>", () => {
        describe("request", () => {
            const adapter = new TestRequestAdapter();
            const adapterWithBase = new TestRequestAdapter({
                baseUrl: BASE_URL,
            });

            it("should respond with successful body", async () => {
                const okResponse = await adapter.requestImmediate(ROUTE_OK);
                expect(okResponse.success).toBe(true);
                expect(typeof okResponse.body).toBe("string");
                expect(okResponse.request.route).toBe(ROUTE_OK);
                expect(okResponse.request.url).toBe(ROUTE_OK);

                const json = { key: "value" };
                const jsonResponse = await adapterWithBase.requestImmediate(
                    ROUTE_OK,
                    {
                        body: json,
                        contentType: "application/json",
                    }
                );
                expect(jsonResponse.success).toBe(true);
                expect(typeof jsonResponse.body).toBe("object");
                expect(jsonResponse.request.url).toBe(BASE_URL + ROUTE_OK);

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
