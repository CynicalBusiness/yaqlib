import { RequestHeaderEntry, RequestHeaderInput } from "./request.types.js";

/**
 * Container for a collection of HTTP-like headers.
 */
export class HeaderCollection implements Iterable<RequestHeaderEntry> {
    public static readonly empty = new HeaderCollection();

    /**
     * Normalizes the input headers object into a single consistent format: an iterable of [key, value, options?] tuples.
     *
     * Accepts:
     * - An object of either a header value (as a string) or a tuple of [value, options?] for each header.
     * - An iterable of either:
     *   - An object like above
     *   - A tuple of [header, value, options?] for each header
     *
     * @param headers The headers to normalize
     * @returns The normalized headers
     */
    public static *normalize(
        headers: RequestHeaderInput | null | undefined
    ): Generator<RequestHeaderEntry> {
        if (!headers) return;
        if (typeof headers !== "object") {
            throw new TypeError("Headers must be an object or array");
        }

        if (!(Symbol.iterator in headers)) {
            return yield* this.normalize([headers]);
        }

        for (const item of headers) {
            if (!(Symbol.iterator in item)) {
                yield* this.normalize(Object.entries(item));
                continue;
            }

            let [key, entry, options] = item;
            if (typeof key !== "string") {
                key = String(key);
            }

            if (Array.isArray(entry)) {
                const [value, opts] = entry;
                entry = value;
                options = opts;
            }

            if (entry === undefined) continue;
            if (entry !== null && typeof entry !== "string") {
                entry = String(entry);
            }

            yield [key, entry, options];
        }
    }

    /**
     * The underlying array of headers.
     */
    public readonly headers: ReadonlyArray<RequestHeaderEntry>;

    public constructor(...inputs: Array<RequestHeaderInput | undefined>) {
        this.headers = [
            ...Iterator.from(inputs).flatMap((input) =>
                HeaderCollection.normalize(input)
            ),
        ];
    }

    public get length() {
        return this.headers.length;
    }

    /**
     * Alias for getting the `Content-Type` header.
     */
    public get contentType() {
        return this.get("Content-Type");
    }

    /**
     * Alias for getting the `Authorization` header.
     */
    public get authorization() {
        return this.get("Authorization");
    }

    public extend(
        ...inputs: Array<RequestHeaderInput | undefined>
    ): HeaderCollection {
        return new HeaderCollection(this.headers, ...inputs);
    }

    /**
     * Gets an iterable of all values for the given header key.
     *
     * @param key The header key
     * @param matchCase Whether or not to match the case of the key, defaults to `false`
     * @returns An iterable of all values for the given key
     */
    public *valuesFor(key: string, matchCase = false): Generator<string> {
        for (const [k, v] of this.headers) {
            if (matchCase ? k === key : k.toLowerCase() === key.toLowerCase()) {
                yield v;
            }
        }
    }

    /**
     * Eagerly gets all headers with the given key as an array.
     *
     * @param key The header key
     * @param matchCase Whether or not to match the case of the key, defaults to `false`
     * @returns The headers with the given key
     */
    public getAll(key: string, matchCase?: boolean): string[] {
        return this.valuesFor(key, matchCase).toArray();
    }

    /**
     * Gets the *last* header with the given key.
     *
     * @param key The header key
     * @param matchCase Whether or not to match the case of the key, defaults to `false`
     * @returns The header with the given key, or `undefined` if not found
     */
    public get(key: string, matchCase = false): string | undefined {
        for (let i = this.headers.length - 1; i >= 0; i--) {
            const [k, v] = this.headers[i];
            if (matchCase ? k === key : k.toLowerCase() === key.toLowerCase()) {
                return v;
            }
        }
        return undefined;
    }

    public [Symbol.iterator]() {
        return this.headers[Symbol.iterator]();
    }
}
