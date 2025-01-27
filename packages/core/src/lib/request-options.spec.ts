import { RequestOptions } from "./request-options.js";

describe("class RequestOptions", () => {
    describe("instance", () => {
        const options = RequestOptions.default;

        describe("extend", () => {
            it("should create a new, extended options object", () => {
                const extOptions = options.extend({
                    onlyAllowedStatuses: true,
                    headers: [["test", 1]],
                });
                expect(extOptions.method).toEqual(options.method);
                expect(extOptions.onlyAllowedStatuses).toEqual(true);
                expect(extOptions.headers.length).toEqual(
                    options.headers.length + 1
                );
            });
        });

        describe("isStatusAllowed", () => {
            it("should allow 2xx and whitelisted by default", () => {
                expect(options.isStatusAllowed(200)).toBe(true);
                expect(options.isStatusAllowed(201)).toBe(true);
                expect(options.isStatusAllowed(404)).toBe(false);

                const allowAny = options.extend({
                    allowedStatues: [
                        "0" as unknown as number,
                        RequestOptions.allowAnyStatus,
                    ],
                });
                expect(allowAny.isStatusAllowed(404)).toBe(true);
                expect(allowAny.isStatusAllowed(500)).toBe(true);
            });

            it("should only allow whitelisted if onlyAllowedStatuses is set", () => {
                const allow201 = options.extend({
                    onlyAllowedStatuses: true,
                    allowedStatues: [201],
                });
                expect(allow201.isStatusAllowed(201)).toBe(true);
                expect(allow201.isStatusAllowed(200)).toBe(false);

                const allow400s = options.extend({
                    onlyAllowedStatuses: true,
                    allowedStatues: [RequestOptions.allow400Statuses],
                });
                expect(allow400s.isStatusAllowed(404)).toBe(true);
                expect(allow400s.isStatusAllowed(200)).toBe(false);
            });
        });
    });
});
