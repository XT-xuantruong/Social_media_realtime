export class ResponseDto<T> {
  message: string;
  status: number;
  data: T;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };

  constructor(message: string, status: number, data: T, pagination?: any) {
    this.message = message;
    this.status = status;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
  }
}
