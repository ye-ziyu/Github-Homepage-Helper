import { Type } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
export declare const ApiResponse: <TModel extends Type<any>>(model: TModel, options?: Omit<ApiResponseOptions, "type">) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
