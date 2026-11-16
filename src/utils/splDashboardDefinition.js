export const canvasWidth = 1200;
export const canvasHeight = 5400;
export const panelTypes = { number: "Single value", chart: "Bar chart", table: "Table" };
export const dashboardIndex = (spl) => /^index\s*=\s*([\w-]+)(?=\s|\||$)/i.exec(spl.trim())?.[1];

const clamp = (value, min, max) => Math.round(Math.min(max, Math.max(min, value)));

export function fitPosition({ x, y, width, height }) {
  const w = clamp(width, 240, canvasWidth);
  const h = clamp(height, 160, canvasHeight);
  return { x: clamp(x, 0, canvasWidth - w), y: clamp(y, 0, canvasHeight - h), width: w, height: h };
}

export function panelPosition(panel, index) {
  return panel.position || { x: (index % 2) * 600 + 12, y: Math.floor(index / 2) * 304 + 12, width: 576, height: 280 };
}

export function dashboardSource(name, layout, panels) {
  return JSON.stringify({
    version: 1, name, layout,
    panels: panels.map(({ id, title, type, spl, position }, index) => ({
      id, title, type, spl, position: position || (layout === "absolute" ? panelPosition({}, index) : undefined),
    })),
  }, null, 2);
}

export function parseDashboardSource(source) {
  const definition = JSON.parse(source);
  if (definition?.version !== 1) throw new Error("Use a Studio dashboard definition with version 1.");
  const { name, layout, panels } = definition;
  if (typeof name !== "string" || !name.trim() || name.length > 100) throw new Error("Enter a dashboard name of up to 100 characters.");
  if (!["grid", "absolute"].includes(layout)) throw new Error("Set layout to grid or absolute.");
  if (!Array.isArray(panels) || panels.length > 16) throw new Error("Use an array with up to 16 panels.");
  const ids = new Set();
  return { name: name.trim(), layout, panels: panels.map((panel, index) => {
    const { id, title, type, spl, position } = panel ?? {};
    const prefix = `Panel ${index + 1}`;
    if (typeof id !== "string" || !id.trim() || id !== id.trim() || id.length > 80 || ids.has(id)) throw new Error(`${prefix} needs a unique ID of up to 80 characters.`);
    ids.add(id);
    if (typeof title !== "string" || !title.trim() || title.length > 80) throw new Error(`${prefix} needs a title of up to 80 characters.`);
    if (!Object.hasOwn(panelTypes, type)) throw new Error(`${prefix} needs type number, chart, or table.`);
    if (typeof spl !== "string" || spl.length > 3000 || !dashboardIndex(spl)) throw new Error(`${prefix} must start its SPL with index= and use up to 3,000 characters.`);
    if (position != null) {
      const { x, y, width, height } = position;
      if (![x, y, width, height].every(Number.isInteger) || x < 0 || y < 0 || width < 240 || height < 160 || x + width > canvasWidth || y + height > canvasHeight) {
        throw new Error(`${prefix} position must fit inside the 1,200 × 5,400 canvas (minimum size 240 × 160).`);
      }
    }
    return { id, title: title.trim(), type, spl: spl.trim(), position: position == null ? undefined : { x: position.x, y: position.y, width: position.width, height: position.height } };
  }) };
}
