const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND'
};

class APIError extends Error {
  constructor(message, type, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.status = status;
    this.data = data;
  }
}

// Request deduplication cache
const pendingRequests = new Map();

const getAuthHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  try {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch (e) {
    // Silent fail
  }
  return headers;
};

const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u);

const createRequestKey = (endpoint, options) => {
  return `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || '')}`;
};

export const apiRequest = async (endpoint, options = {}, { timeout = 10000, retryOn429 = true, deduplicate = true } = {}) => {
  const url = isAbsoluteUrl(endpoint) ? endpoint : `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const config = {
    ...options,
    method: (options.method || 'GET').toUpperCase(),
    headers: {
      ...getAuthHeaders(isFormData),
      ...(options.headers || {})
    },
    credentials: options.credentials ?? "include",
  };
  if (deduplicate && config.method === 'GET') {
    const requestKey = createRequestKey(endpoint, config);
    
    if (pendingRequests.has(requestKey)) {
      console.log('🔄 Reusing pending request:', requestKey);
      return pendingRequests.get(requestKey);
    }
  }

  const doFetch = async (signal) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { ...config, signal: signal || controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const executeRequest = async () => {
    let response;
    
    try {
      response = await doFetch();
    } catch (err) {
      if (err.name === "AbortError") {
        throw new APIError("Request timed out", API_ERRORS.NETWORK_ERROR, 0, null);
      }
      throw err;
    }

    if (response.status === 204) {
      if (!response.ok) {
        throw new APIError("No content", API_ERRORS.SERVER_ERROR, 204, null);
      }
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    if (!response.ok) {
      if (response.status === 429 && retryOn429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 3000;
        console.warn(`Rate limited. Retrying after ${waitMs}ms...`);
        await new Promise((res) => setTimeout(res, waitMs));
        return apiRequest(endpoint, options, { timeout, retryOn429: false, deduplicate: false });
      }

      switch (response.status) {
        case 401:
          try {
            window.dispatchEvent(new CustomEvent("auth-expired"));
          } catch {}
          throw new APIError(
            (data && data.message) || "Authentication required",
            API_ERRORS.UNAUTHORIZED,
            401,
            data
          );
        case 400:
          throw new APIError(
            (data && data.message) || "Invalid request",
            API_ERRORS.VALIDATION_ERROR,
            400,
            data
          );
        case 404:
          throw new APIError(
            (data && data.message) || "Resource not found",
            API_ERRORS.NOT_FOUND,
            404,
            data
          );
        case 429:
          throw new APIError(
            (data && data.message) || "Too many requests",
            API_ERRORS.RATE_LIMITED,
            429,
            data
          );
        default:
          throw new APIError(
            (data && data.message) || response.statusText || "Server error",
            API_ERRORS.SERVER_ERROR,
            response.status,
            data
          );
      }
    }

    return data;
  };

  let promise;
  const requestKey = createRequestKey(endpoint, config);
  
  if (deduplicate && config.method === 'GET') {
    promise = executeRequest().finally(() => {
      setTimeout(() => {
        pendingRequests.delete(requestKey);
      }, 100);
    });
    
    pendingRequests.set(requestKey, promise);
    return promise;
  } else {
    return executeRequest();
  }
};

export const apiRequestWithLoading = async (endpoint, options = {}, setLoading, opts = {}) => {
  if (typeof setLoading === "function") setLoading(true);
  try {
    const result = await apiRequest(endpoint, options, opts);
    return result;
  } finally {
    if (typeof setLoading === "function") setLoading(false);
  }
};

export const createFormDataRequest = (data = {}, fileKey = "file", file = null, method = "POST") => {
  const formData = new FormData();
  if (file) formData.append(fileKey, file);

  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, v);
  });

  return {
    method: method.toUpperCase(),
    body: formData,
    headers: {},
  };
};

export const clearPendingRequests = () => {
  pendingRequests.clear();
};

export default {
  apiRequest,
  apiRequestWithLoading,
  createFormDataRequest,
  clearPendingRequests,
  APIError,
  API_ERRORS,
};