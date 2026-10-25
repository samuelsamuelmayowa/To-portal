/**
 * Repeatable, synthetic training events. These are not actual production logs.
 * Existing LOGS indexes remain available for compatibility with the old lab.
 */
import { LOGS } from "./logs";
const now = Date.now();
const agents = ["edge-01", "edge-02", "api-01", "api-02"];
const people = ["ade", "zainab", "chioma", "tobi", "guest", "support"];
const endpoints = ["/", "/login", "/products", "/cart", "/checkout", "/api/orders"];
const levels = ["INFO", "INFO", "INFO", "WARN", "ERROR"];
const statusCodes = [200, 200, 200, 201, 301, 400, 401, 403, 404, 429, 500, 503];
const iso = (minutesBack) => new Date(now - minutesBack * 60000).toISOString();
const build = (length, fn) => Array.from({ length }, (_, i) => fn(i));

const training_web = build(650, (i) => {
  const status = statusCodes[(i * 7 + Math.floor(i / 13)) % statusCodes.length];
  const endpoint = endpoints[(i * 3 + Math.floor(i / 9)) % endpoints.length];
  const response_time = 45 + (i * 37) % 1200;
  const user = people[(i * 5 + Math.floor(i / 11)) % people.length];
  return {
    _time: iso(i * 6), index: "training_web", sourcetype: "access_combined",
    host: agents[i % agents.length], endpoint, url: endpoint,
    method: i % 7 === 0 ? "POST" : "GET", status, response_time,
    bytes: 900 + (i * 173) % 15000, user,
    clientip: `192.0.2.${1 + i % 220}`,
    message: `${status} ${endpoint} completed in ${response_time}ms for ${user}`,
    _raw: `${status} ${endpoint} completed in ${response_time}ms for ${user}`,
  };
});
const training_security = build(500, (i) => {
  const action = i % 6 === 0 || i % 11 === 0 ? "failure" : "success";
  const user = people[(i * 7 + Math.floor(i / 12)) % people.length];
  const host = agents[(i + 2) % agents.length];
  return {
    _time: iso(i * 9), index: "training_security", sourcetype: "auth_audit",
    host, user, action, event_type: "login", status: action === "success" ? 200 : 401,
    clientip: `198.51.100.${1 + (i * 9) % 200}`,
    message: `login ${action} for user=${user} on ${host}`,
    _raw: `login ${action} for user=${user} on ${host}`,
  };
});
const training_apps = build(540, (i) => {
  const level = levels[(i * 7 + Math.floor(i / 15)) % levels.length];
  const service = ["checkout", "payments", "catalog", "notifications"][i % 4];
  const duration_ms = 30 + (i * 41) % 2300;
  return {
    _time: iso(i * 8), index: "training_apps", sourcetype: "application_json",
    host: agents[i % agents.length], service, level, duration_ms,
    response_time: duration_ms, status: level === "ERROR" ? 500 : 200,
    message: `${level}: ${service} request finished in ${duration_ms}ms`,
    _raw: `${level}: ${service} request finished in ${duration_ms}ms`,
  };
});
const products = ["Laptop", "Mouse", "Keyboard", "Headphones", "Monitor"];
const training_sales = build(350, (i) => {
  const product = products[(i * 3 + Math.floor(i / 8)) % products.length];
  const quantity = 1 + i % 4;
  const unit_price = [280000, 9500, 28000, 34000, 120000][products.indexOf(product)];
  const revenue = quantity * unit_price;
  return {
    _time: iso(i * 24), index: "training_sales", sourcetype: "commerce_orders",
    host: "commerce-api", order_id: `ORD-${10000 + i}`, product, quantity,
    unit_price, revenue, payment_status: i % 9 === 0 ? "failed" : "paid",
    region: ["Lagos", "Abuja", "Ibadan", "Port Harcourt"][i % 4],
    message: `Order ORD-${10000 + i} ${product} quantity=${quantity} payment_status=${i % 9 === 0 ? "failed" : "paid"}`,
    _raw: `Order ORD-${10000 + i} ${product} quantity=${quantity}`,
  };
});
// A small end-to-end set of events for transaction/correlation teaching.
// Every session has a LOGIN and one or more business events sharing session_id.
const training_sessions = build(90, (i) => {
  const sessionNumber = Math.floor(i / 3);
  const eventStep = i % 3;
  const user = people[sessionNumber % people.length];
  const session_id = `SESS-${2000 + sessionNumber}`;
  const activity = eventStep === 0 ? "login" : eventStep === 1 ? "view_product" : "checkout";
  const outcome = eventStep === 0 ? "success" : eventStep === 1 ? "ok" : sessionNumber % 5 === 0 ? "failed" : "success";
  const minutesBack = (30 - sessionNumber) * 20 + (2 - eventStep) * 3;
  return {
    _time: iso(minutesBack), index: "training_sessions", sourcetype: "app_journey",
    host: agents[sessionNumber % agents.length], user, session_id,
    activity, outcome, status: outcome === "failed" ? 500 : 200,
    source: eventStep === 0 ? "identity-service" : "storefront",
    message: `${activity} outcome=${outcome} user=${user} session=${session_id}`,
    _raw: `session=${session_id} user=${user} activity=${activity} outcome=${outcome}`,
  };
});
export const TRAINING_LOGS = { training_web, training_security, training_apps, training_sales, training_sessions };
export const LAB_LOGS = { ...TRAINING_LOGS, ...(LOGS || {}) };
export const TRAINING_DATASETS = [
  { id: "training_web", name: "Web Traffic", category: "Web analytics", fields: "status, endpoint, response_time, user" },
  { id: "training_security", name: "Security Events", category: "SOC fundamentals", fields: "action, user, clientip, host" },
  { id: "training_apps", name: "Application Logs", category: "DevOps monitoring", fields: "level, service, duration_ms" },
  { id: "training_sales", name: "Sales Records", category: "Business analytics", fields: "product, revenue, region, payment_status" },
  { id: "training_sessions", name: "Customer Journeys", category: "Cross-service correlation", fields: "session_id, user, activity, outcome, source" },
];
