export const LOGS = {
  _internal: Array.from({ length: 300 }, (_, i) => ({
    _time: Date.now() - i * 60000,
    index: "_internal",
    sourcetype: i % 3 === 0 ? "splunkd" : i % 3 === 1 ? "metrics.log" : "audittrail",
    level: i % 10 === 0 ? "ERROR" : i % 5 === 0 ? "WARN" : "INFO",
    component: "Indexer",
    message: "Internal Splunk activity",
  })),

  auth_logs: Array.from({ length: 200 }, (_, i) => ({
    _time: Date.now() - i * 300000,
    index: "auth_logs",
    user: ["admin", "root", "john", "mary"][i % 4],
    action: i % 6 === 0 ? "failed_login" : "login_success",
    src_ip: `192.168.1.${i % 50}`,
    status: i % 6 === 0 ? "FAILED" : "SUCCESS",
  })),

  web_logs: Array.from({ length: 400 }, (_, i) => ({
    _time: Date.now() - i * 120000,
    index: "web_logs",
    method: ["GET", "POST"][i % 2],
    status: [200, 200, 200, 404, 500][i % 5],
    url: ["/login", "/dashboard", "/api/orders"][i % 3],
    response_time: Math.floor(Math.random() * 2000),
  })),
};
