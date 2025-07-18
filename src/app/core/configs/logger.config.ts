import { Params } from 'nestjs-pino';

export const getLoggerConfig = (): Params => ({
  pinoHttp: {
    autoLogging: false,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: false,
      },
    },
    quietReqLogger: true,
  },
});
