export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(409, "conflict", message, details);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Доступ запрещён") {
    super(403, "forbidden", message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Не найдено") {
    super(404, "not_found", message);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(400, "validation_error", message, details);
  }
}

export function errorResponse(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "ZodError"
  ) {
    return Response.json(
      { error: { code: "validation_error", message: "Некорректные данные", details: error } },
      { status: 400 },
    );
  }

  if (error instanceof HttpError) {
    return Response.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status },
    );
  }

  console.error(error);
  return Response.json(
    { error: { code: "internal_error", message: "Внутренняя ошибка сервера" } },
    { status: 500 },
  );
}
