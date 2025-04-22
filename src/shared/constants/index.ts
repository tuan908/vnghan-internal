export const API_VERSION = "/api/v1";

/**
 * Predefined error types
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: "bad_request",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  METHOD_NOT_ALLOWED: "method_not_allowed",
  CONFLICT: "conflict",
  UNPROCESSABLE_ENTITY: "unprocessable_entity",
  TOO_MANY_REQUESTS: "too_many_requests",

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: "internal_server_error",
  NOT_IMPLEMENTED: "not_implemented",
  SERVICE_UNAVAILABLE: "service_unavailable",

  // Custom domain errors
  VALIDATION_ERROR: "validation_error",
  BUSINESS_CONSTRAINT_VIOLATION: "business_constraint_violation",
  RESOURCE_EXISTS: "resource_exists",
  RESOURCE_EXPIRED: "resource_expired",
  DEPENDENCY_FAILURE: "dependency_failure",
} as const;

// Type-safe error code union type
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const PAGE_SIZE = 10;

/**
 * text-overflow classes
 */
export const CSS_TEXT_ELLIPSIS = `whitespace-nowrap overflow-hidden text-ellipsis`;

export const DEFAULT_MATERIAL_ID = 9999;

export const DEFAULT_TYPE_ID = 9999;

export const DEFAULT_SIZE_ID = 9999;

export const QUERY_KEY = {
  SCREW: "screws",
  SCREW_MATERIAL: "screw-materials",
  SCREW_TYPE: "screw-types",
};

export const UserRoles = {
  Viewer: "001",
  Editor: "002",
  Owner: "003",
  Administrator: "004",
};

export const DATE_FORMAT_DD_MM_YYYY_WITH_SLASH = "dd/MM/yyyy";
export const DATE_FORMAT_YYYY_MM_DD_HH_MM_SS_SSS = "yyyyMMddHHmmsssss";

export const TemplateTypes = {
  Customer: "customer",
  Screw: "screw",
};
