import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  metadata?: {
    timestamp: string;
    duration: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const start = Date.now();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - start,
        },
      })),
    );
  }
}
