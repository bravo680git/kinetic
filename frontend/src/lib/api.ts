import {
  isApiError,
  QueryRequest,
  QueryResponse,
  SchemaResponse,
  TestConnectionRequest,
  TestConnectionResponse,
  Config,
  UpdateRowRequest,
  UpdateRowResponse,
  SnippetsConfig,
} from "../../../shared/types";

const API_BASE = "/api";

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (isApiError(data)) {
        throw new Error(data.detail || data.error);
      }
    } catch (e) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
  }

  const data = await response.json();

  // Check if response body contains an error field (even if HTTP 200)
  if (isApiError(data)) {
    throw new Error(data.detail || data.error);
  }

  return data;
}

export async function fetchSchema(connStr: string): Promise<SchemaResponse> {
  return apiCall<SchemaResponse>(
    `/schema?connection_string=${encodeURIComponent(connStr)}`,
  );
}

export async function executeQuery(req: QueryRequest): Promise<QueryResponse> {
  return apiCall<QueryResponse>("/query", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function updateRow(
  req: UpdateRowRequest,
): Promise<UpdateRowResponse> {
  return apiCall<UpdateRowResponse>("/update", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function testConnection(
  req: TestConnectionRequest,
): Promise<TestConnectionResponse> {
  return apiCall<TestConnectionResponse>("/connections/test", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function fetchConfig(): Promise<Config> {
  return apiCall<Config>("/config");
}

export async function updateConfig(req: Config): Promise<Config> {
  return apiCall<Config>("/config", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function fetchSnippets(): Promise<SnippetsConfig> {
  return apiCall<SnippetsConfig>("/snippets");
}

export async function updateSnippets(
  snippets: SnippetsConfig,
): Promise<SnippetsConfig> {
  return apiCall<SnippetsConfig>("/snippets", {
    method: "POST",
    body: JSON.stringify(snippets),
  });
}

export async function resetSnippets(): Promise<SnippetsConfig> {
  return apiCall<SnippetsConfig>("/snippets/reset", {
    method: "POST",
  });
}
