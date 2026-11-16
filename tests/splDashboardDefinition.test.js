import test from "node:test";
import assert from "node:assert/strict";
import { dashboardSource, fitPosition, panelPosition, parseDashboardSource } from "../src/utils/splDashboardDefinition.js";

const panel = { id: "p1", title: "Sign-ins", type: "number", spl: "index=toa_soc source=vpn | stats count" };
const position = { x: 300, y: 24, width: 500, height: 240 };

test("absolute positions survive the JSON round trip and a switch to Grid", () => {
  for (const layout of ["grid", "absolute"]) {
    const definition = parseDashboardSource(dashboardSource("SOC", layout, [{ ...panel, position }]));
    assert.equal(definition.layout, layout);
    assert.deepEqual(definition.panels[0], { ...panel, position });
  }
});

test("older panels receive a canvas position when first opened in Absolute", () => {
  const definition = parseDashboardSource(dashboardSource("SOC", "absolute", [panel]));
  assert.deepEqual(definition.panels[0].position, panelPosition(panel, 0));
  assert.deepEqual(fitPosition({ x: 1300, y: -3, width: 500, height: 50 }), { x: 700, y: 0, width: 500, height: 160 });
});

test("JSON import rejects positions outside the canvas and duplicate panel IDs", () => {
  assert.throws(() => parseDashboardSource(dashboardSource("SOC", "absolute", [{ ...panel, position: { ...position, x: 1000 } }])), /fit inside/);
  assert.throws(() => parseDashboardSource(dashboardSource("SOC", "grid", [panel, panel])), /unique ID/);
});
