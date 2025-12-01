const client = require("prom-client")
const register = new client.Registry()

// Collect default Node.js metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register })

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
})

const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status"],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000],
})

const mongoConnectionState = new client.Gauge({
  name: "mongo_connection_state",
  help: "Mongoose connection state (0=disconnected,1=connected,2=connecting,3=disconnecting)",
})

register.registerMetric(httpRequestsTotal)
register.registerMetric(httpRequestDurationMs)
register.registerMetric(mongoConnectionState)

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationMs,
  mongoConnectionState,
}
