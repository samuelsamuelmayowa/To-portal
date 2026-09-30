import test from "node:test";
import assert from "node:assert/strict";
import { getPaperTradeErrorMessage } from "../src/services/paperTradeErrors.js";

test("paper trade errors map only safe known categories to student-facing copy", async () => {
  const responseError = (status, body) => ({ context: new Response(JSON.stringify(body), { status }), message: "Edge Function returned a non-2xx status code" });
  assert.match(await getPaperTradeErrorMessage(responseError(401, {})), /session has expired/i);
  assert.match(await getPaperTradeErrorMessage(responseError(400, { error: "Insufficient buying power" })), /not enough buying power/i);
  assert.match(await getPaperTradeErrorMessage(responseError(400, { error: "Invalid quantity" })), /valid whole-share quantity/i);
  assert.match(await getPaperTradeErrorMessage(responseError(502, { error: "Alpaca fill price unavailable" })), /market price is unavailable/i);
  assert.match(await getPaperTradeErrorMessage(responseError(500, { error: "Database constraint violation" })), /could not be completed/i);
  assert.doesNotMatch(await getPaperTradeErrorMessage(responseError(500, { error: "Database constraint violation" })), /database constraint/i);
});
