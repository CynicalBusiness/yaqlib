import { HTTPStatus } from "./consts.js";
import { RequestResponse } from "./request-response.js";

const ROUTE = "route";

describe("class RequestResponse", () => {
    describe("instance", () => {
        const okResponse = new RequestResponse({
            status: HTTPStatus.OK,
            body: "ok",
            route: ROUTE,
        });
        const errorResponse = new RequestResponse({
            status: 999,
            body: "error",
            route: ROUTE,
        });

        it("should have correctly populated values", () => {
            expect(okResponse.status).toBe(HTTPStatus.OK);
            expect(okResponse.statusText).toBe(HTTPStatus[HTTPStatus.OK]);
            expect(okResponse.success).toBe(true);

            expect(errorResponse.status).toBe(999);
            expect(errorResponse.statusText).toBe("UNKNOWN");
            expect(errorResponse.success).toBe(false);
        });
    });
});
