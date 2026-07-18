export function staffHeaders(slug: string, contentType?: "json") {
  return {
    "x-wedbar-token": slug,
    ...(contentType === "json" ? { "Content-Type": "application/json" } : {}),
  };
}

export async function readApiJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      data.error &&
      typeof data.error === "object" &&
      "message" in data.error &&
      typeof data.error.message === "string"
        ? data.error.message
        : "Запрос не выполнен";
    throw new Error(message);
  }

  return data as T;
}
