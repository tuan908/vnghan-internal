import { nullsToUndefined, tryCatch } from "@/lib/utils";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
  tag?: string;
  timeout?: number; // ✅ Added optional timeout
};

class HttpError extends Error {
  constructor(public response: Response) {
    super(`HTTP Error ${response.status}: ${response.statusText}`);
    this.name = "HttpError";
  }
}

class HttpClient {
  private _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  private async request<T>(
    url: string,
    method: HttpMethod,
    options: RequestOptions = {}
  ): Promise<T | undefined> {
    const { params, headers, tag, timeout, ...restOptions } = options;

    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const fullUrl = `${this._baseUrl}${url}${queryParams}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const controller = new AbortController(); // ✅ Added timeout support
    const timeoutId = timeout
      ? setTimeout(() => controller.abort(), timeout)
      : null;

    const response = fetch(fullUrl, {
      ...restOptions,
      method,
      headers: { ...defaultHeaders, ...headers },
      signal: controller.signal,
      next: {
        tags: tag ? [tag] : undefined,
      },
    });

    const { data, error } = await tryCatch(response);

    if (error) {
      throw error;
    }

    const json = await data.json();
    if (timeoutId) clearTimeout(timeoutId);
    return nullsToUndefined(json) as T;
  }

  public async get<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, "GET", options);
  }

  public async post<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, "POST", {
      ...options,
      body: JSON.stringify(data),
    });
  }

  public async patch<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, "PATCH", {
      ...options,
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(url: string, data: any, options?: RequestOptions) {
    return this.request<T>(url, "DELETE", {
      ...options,
      body: JSON.stringify(data),
    });
  }

  public async uploadFile<T>(
    url: string,
    file: File,
    options?: RequestOptions
  ): Promise<T | undefined> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data, error } = await tryCatch(
        fetch(`${this._baseUrl}${url}`, {
          ...options,
          method: "POST",
          body: formData,
        })
      );

      if (error) {
        throw error;
      }

      return data.json() as Promise<T>;
    } catch (error) {
      console.error("File Upload Failed:", error);
      return undefined;
    }
  }

  public async downloadFile(url: string, filename: string): Promise<void> {
    const response = fetch(`${this._baseUrl}${url}`);

    const { data, error } = await tryCatch(response);

    if (error) {
      throw error;
    }

    const blob = await data.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}

// ✅ Used `process.env` safely with fallback
const API = new HttpClient(process.env["API_URL"] || "");

export default API;
