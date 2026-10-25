/**
 * Fake CSV-style lookup tables for educational queries. No personal data or network calls.
 * "inputlookup" and "lookup" use these in-memory rows; no arbitrary file access.
 */
export const SPL_LOOKUPS = {
  "user_directory.csv": [
    { user: "ade", department: "Engineering", role: "developer", risk_tier: "standard" },
    { user: "zainab", department: "Operations", role: "analyst", risk_tier: "standard" },
    { user: "chioma", department: "Finance", role: "accountant", risk_tier: "standard" },
    { user: "tobi", department: "Support", role: "agent", risk_tier: "standard" },
    { user: "guest", department: "External", role: "visitor", risk_tier: "review" },
    { user: "support", department: "IT", role: "administrator", risk_tier: "review" },
  ],
  "asset_inventory.csv": [
    { host: "edge-01", environment: "production", owner: "Web Team", importance: "high" },
    { host: "edge-02", environment: "staging", owner: "Web Team", importance: "medium" },
    { host: "api-01", environment: "production", owner: "Platform Team", importance: "high" },
    { host: "api-02", environment: "development", owner: "Platform Team", importance: "low" },
  ],
  "product_catalog.csv": [
    { product: "Laptop", category: "Computers", supplier: "NorthStar", tax_rate: 0.075 },
    { product: "Mouse", category: "Accessories", supplier: "Orbit", tax_rate: 0.075 },
    { product: "Keyboard", category: "Accessories", supplier: "Orbit", tax_rate: 0.075 },
    { product: "Headphones", category: "Audio", supplier: "Wave", tax_rate: 0.075 },
    { product: "Monitor", category: "Displays", supplier: "NorthStar", tax_rate: 0.075 },
  ],
};
export const LOOKUP_CATALOG = Object.entries(SPL_LOOKUPS).map(([name, rows]) => ({
  name, count: rows.length, fields: Object.keys(rows[0] || {}), rows,
}));
