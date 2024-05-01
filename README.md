# NestJS Otel to Gcloud
### What a headache 

## Some notes

### Regarding DX
I love DX. The DX when setting up OTLP with Alloy is pretty bad imo.
- No autocomplete when configuring Alloy via its config file
- Constant need to check documentation regarding what the output is, what it requires as input, what I should do with the data, ...
- Debugging errors by painfully trying a small change, rebooting Alloy, hoping it works...

Although the Alloy UI (localhost:12345) is OK. Sometimes it can display errors (in green?!) when going in a Component's details, like this one:
```
Get \"http://127.0.0.1:3000/metrics\": dial tcp 127.0.0.1:3000: connect: connection refused
```
(fix: it needed to be the Docker container name instead of 127.0.0.1)

### Exporter ports
TraceExporter and LogExporter both use gRPC, but the former sends data to port 4318, whilst the latter must use 4317.

### Env vars
The API must have the following env vars set:
- `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`
- `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

... although we configured it in the Pino transport

```js
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
  },
}
```

### Metrics exporter
I didn't really understand how OTLPMetricsExporter works.
I think I'd need to make it scrape Prometheus metrics, which it would send using OTLP to Alloy?
Instead I opted for a direct `prometheus.scrape` in Alloy...

```
// Scrape Prometheus /metrics endpoint 
prometheus.scrape "default" {
    targets = [
		{ "__address__" = env("LOCAL_HOSTED_PROMETHEUS_URL") },
	]	

    forward_to = [prometheus.remote_write.grafana_cloud_prometheus.receiver]
}
```
