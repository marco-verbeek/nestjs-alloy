import * as process from 'process';

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

const otlpExporter = new OTLPTraceExporter({
  url: 'http://alloy:4318/v1/traces',
});

const logExporter = new OTLPLogExporter({
  url: 'http://alloy:4317/v1/logs',
});

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: `nestjs-alloy`,
  }),
  serviceName: 'nestjs-alloy',
  spanProcessors: [new BatchSpanProcessor(otlpExporter)],
  logRecordProcessor: new BatchLogRecordProcessor(logExporter),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new PinoInstrumentation(),
  ],
});

process.on('SIGTERM', () => {
  otelSDK.shutdown().finally(() => process.exit(0));
});
