export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function errorText(data: Record<string, unknown>, fallback: string) {
  if (typeof data.error === "string") return data.error;
  const errors = data.errors as { message?: string }[] | undefined;
  return errors?.[0]?.message ?? fallback;
}
