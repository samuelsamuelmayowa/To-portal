/**
 * Local-only administration sandbox. This DOES NOT touch a Splunk server,
 * filesystem monitors or real authorization. Storage is browser-local.
 */
import { LAB_LOGS } from "./splTrainingData.js";
export const ADMIN_KEY = "to_splunk_admin_sandbox_v1";
export const ADMIN_SEED = { indexes: [], inputs: [], roles: [], healthCheckCompleted: false };
export const VALID_ROLE_NAMES = ["student", "analyst", "reviewer"];
const indexValid = (name) => /^[a-z][a-z0-9_]{2,28}$/i.test(name || "");
export function getAdminState() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
    if (raw && Array.isArray(raw.indexes) && Array.isArray(raw.inputs) && Array.isArray(raw.roles)) return raw;
  } catch { /* no persisted state */ }
  return { ...ADMIN_SEED, indexes: [], inputs: [], roles: [] };
}
export function saveAdminState(state) {
  try { localStorage.setItem(ADMIN_KEY, JSON.stringify(state)); } catch { /* private browser may block storage */ }
}
export function addAdminIndex(state, index) {
  const name = String(index.name || "").trim().toLowerCase();
  const retentionDays = Number(index.retentionDays);
  if (!indexValid(name)) throw Error("Index names must start with a letter and contain 3–29 letters, numbers or underscores.");
  if (Object.hasOwn(LAB_LOGS, name) || state.indexes.some((x) => x.name === name)) throw Error("That index already exists. Choose a new name.");
  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) throw Error("Choose 1 to 3650 retention days.");
  return { ...state, indexes: [...state.indexes, { name, retentionDays }] };
}
export function addAdminInput(state, input) {
  const index = String(input.index || "");
  const source = String(input.source || "").trim();
  const sourcetype = String(input.sourcetype || "").trim();
  const host = String(input.host || "").trim();
  if (!state.indexes.some((x) => x.name === index)) throw Error("Choose an index you created in the simulator.");
  if (!source.startsWith("/") || source.length > 120 || /[\r\n\[\]]/.test(source)) throw Error("Use a sample absolute path, for example /var/log/training/app.log.");
  if (!/^[\w-]{2,32}$/.test(sourcetype) || !/^[\w.-]{2,40}$/.test(host)) throw Error("Enter a short sourcetype and host (letters, numbers, _ or -). ");
  if (state.inputs.some((x) => x.index === index && x.source === source)) throw Error("That sample input is already configured.");
  return { ...state, inputs: [...state.inputs, { index, source, sourcetype, host }] };
}
export function assignAdminRole(state, role, index) {
  if (!VALID_ROLE_NAMES.includes(role)) throw Error("Choose a training role.");
  if (!state.indexes.some((x) => x.name === index)) throw Error("Choose a configured index.");
  return { ...state, roles: [...state.roles.filter((x) => !(x.role === role && x.index === index)), { role, index }] };
}
export function updateAdminRetention(state, index, retentionDays) {
  const n = Number(retentionDays);
  if (!Number.isInteger(n) || n < 1 || n > 3650) throw Error("Retention must be 1 to 3650 days.");
  if (!state.indexes.some((x) => x.name === index)) throw Error("Choose a configured index.");
  return { ...state, indexes: state.indexes.map((x) => x.name === index ? { ...x, retentionDays: n } : x) };
}
/** Only static synthetic data is inserted; nothing is read from an actual filesystem. */
export function getLabLogs() {
  const admin = getAdminState();
  const extras = {};
  for (const index of admin.indexes.slice(0, 20)) {
    if (!indexValid(index.name) || Object.hasOwn(LAB_LOGS, index.name)) continue;
    const input = admin.inputs.find((x) => x.index === index.name);
    extras[index.name] = input ? Array.from({ length: 48 }, (_, i) => {
      const level = i % 9 === 0 ? "ERROR" : i % 5 === 0 ? "WARN" : "INFO";
      const event = { _time: new Date(Date.now() - i * 60000).toISOString(), index: index.name,
        source: input.source, sourcetype: input.sourcetype, host: input.host, level,
        service: i % 2 === 0 ? "gateway" : "worker", status: level === "ERROR" ? 500 : 200,
        message: `${level} practice event number ${i + 1} in ${index.name}` };
      return { ...event, _raw: event.message };
    }) : [];
  }
  return { ...LAB_LOGS, ...extras };
}
export function adminProgress(state) {
  return [
    { id: "index", title: "Create an index", done: state.indexes.length > 0 },
    { id: "input", title: "Configure a monitor input", done: state.inputs.length > 0 },
    { id: "retention", title: "Set a retention policy (90 days or less)", done: state.indexes.some((x) => x.retentionDays <= 90) },
    { id: "role", title: "Assign a training role to an index", done: state.roles.length > 0 },
    { id: "health", title: "Run a health check on generated events", done: Boolean(state.healthCheckCompleted) },
  ];
}
export function adminConfPreview(state) {
  const indexes = state.indexes.map((x) => `[${x.name}]\nfrozenTimePeriodInSecs = ${x.retentionDays * 86400}`).join("\n\n");
  const inputs = state.inputs.map((x) => `[monitor://${x.source}]\ndisabled = 0\nindex = ${x.index}\nsourcetype = ${x.sourcetype}\nhost = ${x.host}`).join("\n\n");
  const sourcetypes = [...new Set(state.inputs.map((x) => x.sourcetype))].map((x) => `[${x}]\nSHOULD_LINEMERGE = false`).join("\n\n");
  return { "indexes.conf": indexes || "# Create a sample index first.", "inputs.conf": inputs || "# Add a sample monitoring input first.", "props.conf": sourcetypes || "# Add a sample source type first." };
}
