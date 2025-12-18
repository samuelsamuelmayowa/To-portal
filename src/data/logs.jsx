// src/data/logs.js

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const now = Date.now();

// Generate epoch time spread over last N minutes
const timeMinutesAgo = (m) => now - m * 60 * 1000;

export const LOGS = {
  _internal: Array.from({ length: 1200 }, (_, i) => {
    const level = i % 13 === 0 ? "ERROR" : i % 7 === 0 ? "WARN" : "INFO";
    const sourcetype = pick(["splunkd", "metrics.log", "audittrail", "splunk_web_access"]);
    const component = pick(["Indexer", "SearchHead", "Forwarder", "KVStore"]);
    return {
      _time: timeMinutesAgo(i),
      index: "_internal",
      host: pick(["splunk-idx-01", "splunk-sh-01", "splunk-hf-01"]),
      sourcetype,
      level,
      component,
      message:
        level === "ERROR"
          ? `component=${component} error_code=${pick(["E101", "E202", "E303"])} msg="Operation failed"`
          : `component=${component} msg="Heartbeat ok"`,
    };
  }),

  auth_logs: Array.from({ length: 900 }, (_, i) => {
    const user = pick(["admin", "root", "mary", "john", "analyst1", "analyst2"]);
    const action = i % 6 === 0 ? "failed_login" : "login_success";
    const status = action === "failed_login" ? "FAILED" : "SUCCESS";
    const src_ip = `192.168.${rand(0, 10)}.${rand(1, 254)}`;
    const dest_host = pick(["app-01", "vpn-01", "ad-01", "jumpbox-01"]);
    return {
      _time: timeMinutesAgo(i * 2),
      index: "auth_logs",
      host: dest_host,
      user,
      action,
      src_ip,
      status,
      message: `user=${user} action=${action} src_ip=${src_ip} status=${status}`,
    };
  }),

  web_logs: Array.from({ length: 1500 }, (_, i) => {
    const method = pick(["GET", "POST", "PUT"]);
    const status = pick([200, 200, 200, 201, 301, 401, 403, 404, 500, 502]);
    const url = pick(["/login", "/dashboard", "/api/orders", "/api/users", "/reports", "/assets/app.js"]);
    const rt = rand(20, 2200);
    return {
      _time: timeMinutesAgo(i),
      index: "web_logs",
      host: pick(["web-01", "web-02", "api-01"]),
      method,
      status,
      url,
      response_time: rt,
      user_agent: pick(["Chrome", "Firefox", "Safari", "curl"]),
      message: `${method} ${url} status=${status} rt=${rt}ms`,
    };
  }),

  firewall_logs: Array.from({ length: 1100 }, (_, i) => {
    const action = pick(["ALLOW", "DENY"]);
    const src_ip = `10.${rand(0, 10)}.${rand(0, 255)}.${rand(1, 254)}`;
    const dest_ip = `172.16.${rand(0, 10)}.${rand(1, 254)}`;
    const dest_port = pick([22, 80, 443, 3389, 8080, 9200]);
    return {
      _time: timeMinutesAgo(i * 3),
      index: "firewall_logs",
      host: pick(["fw-01", "fw-02"]),
      action,
      src_ip,
      dest_ip,
      dest_port,
      rule: pick(["default", "corp-web", "vpn-access", "blocked-scan"]),
      message: `action=${action} src_ip=${src_ip} dest_ip=${dest_ip} dest_port=${dest_port}`,
    };
  }),
};

// export const LOGS = {
//   _internal: Array.from({ length: 300 }, (_, i) => ({
//     _time: Date.now() - i * 60000,
//     index: "_internal",
//     sourcetype: i % 3 === 0 ? "splunkd" : i % 3 === 1 ? "metrics.log" : "audittrail",
//     level: i % 10 === 0 ? "ERROR" : i % 5 === 0 ? "WARN" : "INFO",
//     component: "Indexer",
//     message: "Internal Splunk activity",
//   })),

//   auth_logs: Array.from({ length: 200 }, (_, i) => ({
//     _time: Date.now() - i * 300000,
//     index: "auth_logs",
//     user: ["admin", "root", "john", "mary"][i % 4],
//     action: i % 6 === 0 ? "failed_login" : "login_success",
//     src_ip: `192.168.1.${i % 50}`,
//     status: i % 6 === 0 ? "FAILED" : "SUCCESS",
//   })),

//   web_logs: Array.from({ length: 400 }, (_, i) => ({
//     _time: Date.now() - i * 120000,
//     index: "web_logs",
//     method: ["GET", "POST"][i % 2],
//     status: [200, 200, 200, 404, 500][i % 5],
//     url: ["/login", "/dashboard", "/api/orders"][i % 3],
//     response_time: Math.floor(Math.random() * 2000),
//   })),
// };
