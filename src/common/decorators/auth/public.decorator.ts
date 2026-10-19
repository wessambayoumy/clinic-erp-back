import { SetMetadata } from '@nestjs/common';

export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(process.env.IS_PUBLIC_KEY, true);
