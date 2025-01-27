import { HeaderCollection } from "./header-collection.js";
import { RequestHeaderInput } from "./request.types.js";

describe("class HeaderCollection", () => {
    describe("static normalize", () => {
        it("should produce a normalized header collection", () => {
            const normalizedHeaders = [
                ...HeaderCollection.normalize(undefined),
                ...HeaderCollection.normalize({
                    opt1: "value1",
                    opt2: ["value1"],
                }),
                ...HeaderCollection.normalize([
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
                ...HeaderCollection.normalize(invalidInputValue),
            ]).toThrow(TypeError);
        });
    });

    describe("instance with input", () => {
        const headers = new HeaderCollection(
            {
                "Content-Type": "application/json",
            },
            [
                ["foo", 1],
                ["foo", 2, { append: true }],
            ]
        );

        it("should have the correct headers", () => {
            expect(headers.getAll("foo")).toEqual(["1", "2"]);
            expect(headers.getAll("Foo", true)).toHaveLength(0);
            expect(headers.get("content-type", true)).toBeUndefined();
            expect(headers.contentType).toBe("application/json");
            expect(headers.authorization).toBeUndefined();
        });
    });
});
