import {
    RequestAdapter,
    RequestAdapterOptions,
    RequestOptions,
    RequestResponseInput,
} from "@yaqlib/core";

export interface FetchRequestAdapterOptions extends RequestAdapterOptions {
    /**
     * Base URL used for all requests.
     */
    baseUrl: string | URL;
}

/**
 * {@link RequestAdapter} implementation which utilizes {@link https://developer.mozilla.org/docs/Web/API/Window/fetch fetch} to perform the query.
 */
export class FetchRequestAdapter extends RequestAdapter<FetchRequestAdapterOptions> {
    protected override async executeRequest(
        route: string,
        options: RequestOptions
    ): Promise<RequestResponseInput> {
        return this.mapResponse(
            await fetch(
                new URL(route, this.options.baseUrl),
                this.mapRequest(options)
            ),
            route
        );
    }

    protected async extractBody(response: Response): Promise<unknown> {
        if (response.body === null) return null;

        const contentType = response.headers.get("Content-Type");
        if (!contentType || contentType.startsWith("text/")) {
            return response.text();
        }

        if (contentType === "application/json") {
            return response.json();
        }

        if (contentType === "multipart/form-data") {
            return response.formData();
        }

        return response.blob();
    }

    private mapRequest(options: RequestOptions): RequestInit {
        const { body, headers, method } = options;
        const headersObj = new Headers();
        for (const [header, value, options] of headers) {
            if (options?.append) {
                headersObj.append(header, value);
            } else {
                headersObj.set(header, value);
            }
        }

        let bodyInit: BodyInit | null;
        if (!body) {
            bodyInit = null;
        } else if (
            typeof body === "string" ||
            body instanceof ArrayBuffer ||
            body instanceof Blob ||
            body instanceof DataView ||
            body instanceof File ||
            body instanceof FormData ||
            body instanceof URLSearchParams ||
            body instanceof ReadableStream
        ) {
            bodyInit = body;
        } else {
            bodyInit = JSON.stringify(body);
        }

        return {
            method,
            headers: headersObj,
            body: bodyInit,
        };
    }

    private async mapResponse(
        response: Response,
        route: string
    ): Promise<RequestResponseInput> {
        return {
            route,
            status: response.status,
            headers: response.headers,
            body: await this.extractBody(response),
        };
    }
}
