import { applyDecorators, Type } from '@nestjs/common';
import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

export const ApiResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: Omit<ApiResponseOptions, 'type'>,
) => {
  return applyDecorators(
    ApiProperty({
      type: model,
    }),
    // ...other decorators
  );
};
