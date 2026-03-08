export class ResponseUtil {
  static success<T>(data: T, message = 'Success') {
    return { success: true, message, ...data };
  }

  static error(
    message: string,
    errorCode?: number,
    data?: Record<string, unknown>,
  ) {
    return { success: false, message, errorCode, ...(data && { data }) };
  }
}
