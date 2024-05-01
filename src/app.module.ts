import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrometheusModule.register({
      defaultLabels: {
        app: `nestjs-alloy-prom`,
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            {
              target: 'pino-opentelemetry-transport',
              options: {
                logRecordProcessorOptions: [
                  {
                    recordProcessorType: 'batch',
                    exporterOptions: { protocol: 'grpc' },
                  },
                  {
                    recordProcessorType: 'simple',
                    exporterOptions: { protocol: 'console' },
                  },
                ],
                resourceAttributes: {
                  [SEMRESATTRS_SERVICE_NAME]: `nestjs-alloy-pino`,
                },
                loggerName: 'nestjs-alloy',
                serviceVersion: '1.0.0',
              },
            },
          ],
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
