import { firstValueFrom } from "rxjs";
import { TestRequestAdapter } from "../../test/request-adapter.js";
import { TestRequestClient } from "../../test/request-client.js";
import { RequestError } from "./request-error.js";

describe("class RequestClient", () => {
    describe("instance", () => {
        const client = new TestRequestClient(new TestRequestAdapter());

        describe("request", () => {
            it("should perform a request and map the result", async () => {
                const json = { key: "value" };
                const jsonResponse = await firstValueFrom(client.getJson(json));
                expect(jsonResponse.success).toBe(true);
                expect(jsonResponse.body).toEqual(json);
            });
        });

        describe("defineRoute", () => {
            it("should define request helper functions", async () => {
                const okResponse = await firstValueFrom(client.getOk());
                expect(okResponse.success).toBe(true);

                try {
                    await firstValueFrom(client.notFound());
                    fail("Expected not found route to throw error");
                } catch (err) {
                    expect(err).toBeInstanceOf(RequestError);
                    const e = err as RequestError;
                    const res = e.response;
                    expect(res.success).toBe(false);
                    expect(res.status).toBe(404);
                }
            });
        });
    });
});
