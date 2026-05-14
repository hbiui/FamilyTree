// 错误类型定义
export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNAUTHORIZED_ERROR'
  | 'FORBIDDEN_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError?: any;
  statusCode?: number;
}

export const ERROR_MESSAGES: Record<ErrorType, string> = {
  NETWORK_ERROR: '网络不稳定，请检查您的网络连接',
  TIMEOUT_ERROR: '请求超时，请重试',
  UNAUTHORIZED_ERROR: '您需要先登录',
  FORBIDDEN_ERROR: '权限不足，无法执行此操作',
  NOT_FOUND_ERROR: '请求的资源不存在',
  CONFLICT_ERROR: '数据冲突，请刷新后重试',
  VALIDATION_ERROR: '输入的数据有误，请检查',
  SERVER_ERROR: '服务器暂时不可用，请稍后重试',
  UNKNOWN_ERROR: '操作失败，请稍后重试',
};

export const ERROR_RETRY_MESSAGES: Partial<Record<ErrorType, string>> = {
  NETWORK_ERROR: '网络不稳定，已自动重试',
  TIMEOUT_ERROR: '请求超时，正在重试',
  SERVER_ERROR: '服务器异常，正在重试',
};

export function shouldRetry(errorType: ErrorType): boolean {
  return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR', 'UNKNOWN_ERROR'].includes(errorType);
}
