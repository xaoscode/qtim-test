import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';
export const getConfigModuleOptions = (): ConfigModuleOptions => ({
  isGlobal: true,
  validationSchema: Joi.object({
    PORT: Joi.number().required(),

    POSTGRES_HOST: Joi.string().required(),
    POSTGRES_PORT: Joi.number().required(),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().required(),

    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    REDIS_TTL: Joi.number().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required(),
  }),
});
