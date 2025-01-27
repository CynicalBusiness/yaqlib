import {
    ROUTE_NOT_FOUND,
    ROUTE_OK,
    ROUTE_UNKNOWN,
    TestRequestAdapter,
} from "../../test/request-adapter.js";
import { HTTPStatus } from "./consts.js";
import { RequestError } from "./request-error.js";

describe("class RequestAdapter", () => {
    describe("instance", () => {
        const adapter = new TestRequestAdapter();

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
