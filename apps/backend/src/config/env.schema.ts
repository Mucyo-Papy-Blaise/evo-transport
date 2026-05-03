import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(4000),
  API_PREFIX: Joi.string().default('api/v1'),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
  APP_BASE_URL: Joi.string().uri().optional(), // Base URL for document links (defaults to http://localhost:4000)
  FRONTEND_URL: Joi.string().uri().optional(),
  NEXT_PUBLIC_APP_URL: Joi.string().uri().optional(),
  ADMIN_URL: Joi.string().uri().optional(),
  SUPPORT_EMAIL: Joi.string().email().optional(),
  SMTP_HOST: Joi.string().optional(),
  SMTP_SECURE: Joi.string().valid('true', 'false').optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM_EMAIL: Joi.string().email().optional(),
  SMTP_FROM_NAME: Joi.string().optional(),
  PLATFORM_LOGO_URL: Joi.string().optional(),
  BRAND_COLOR: Joi.string().optional(),
  APP_NAME: Joi.string().optional(),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),
});
