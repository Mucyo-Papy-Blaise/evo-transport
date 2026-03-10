// Standard API Error Response
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

// API Response with metadata
export interface ApiResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
}

// Generic API Response wrapper
export interface ApiResponseWithMeta<T = unknown[]> {
  data?: T;
  meta?: ApiResponseMeta;
}

// Error handler utility type
export type ErrorHandler = (error: ApiError) => void;

// Mutation error type for React Query
export interface MutationError extends Error {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
}
