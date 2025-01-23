export { 
/**
 * Status codes for HTTP responses.
 *
 * Re-export of `StatusCodes` from [http-status-codes](https://www.npmjs.com/package/http-status-codes).
 */
StatusCodes as HTTPStatus, } from "http-status-codes";
/**
 * HTTP methods, sometimes referred to as HTTP "verbs", which can be used to qualify requests.
 *
 * See [MDN's HTTP Methods reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) for more information.
 */
export declare enum HTTPMethod {
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    CONNECT = "CONNECT",
    OPTIONS = "OPTIONS",
    TRACE = "TRACE",
    PATCH = "PATCH"
}
