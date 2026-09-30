import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { MarketDataStreamClient } from "../src/services/marketDataStream.js";

class MockBrowserSocket extends EventEmitter {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances = [];

  constructor(url) {
    super();
    this.url = url;
    this.readyState = MockBrowserSocket.CONNECTING;
    this.sent = [];
    MockBrowserSocket.instances.push(this);
  }
  addEventListener(name, callback) { this.on(name, callback); }
  send(payload) { this.sent.push(JSON.parse(payload)); }
  open() { this.readyState = MockBrowserSocket.OPEN; this.emit("open"); }
  receive(message) { this.emit("message", { data: JSON.stringify(message) }); }
  close() { this.readyState = MockBrowserSocket.CLOSED; this.emit("close"); }
}

function fakeTimers() {
  let nextId = 0;
  const pending = new Map();
  return {
    pending,
    setTimeout(callback, delay) { const id = ++nextId; pending.set(id, { callback, delay }); return id; },
    clearTimeout(id) { pending.delete(id); },
  };
}

test("stream client uses one backend socket, multiplexes same-symbol listeners and removes exact subscriptions", () => {
  MockBrowserSocket.instances = [];
  const stream = new MarketDataStreamClient({ url: "wss://backend.example/api/market-data/stream", WebSocketImpl: MockBrowserSocket, timers: fakeTimers() });
  const barsA = [];
  const barsB = [];
  const unsubscribeA = stream.subscribe("AAPL", (bar) => barsA.push(bar));
  const socket = MockBrowserSocket.instances[0];
  assert.equal(socket.url, "wss://backend.example/api/market-data/stream");
  const unsubscribeB = stream.subscribe("AAPL", (bar) => barsB.push(bar));
  const unsubscribeMsft = stream.subscribe("MSFT", () => {});
  assert.equal(MockBrowserSocket.instances.length, 1);
  socket.open();
  assert.deepEqual(socket.sent, [
    { action: "subscribe", symbol: "AAPL" },
    { action: "subscribe", symbol: "MSFT" },
  ]);
  socket.receive({ type: "subscribed", symbol: "AAPL" });
  const bar = { type: "minute_bar", symbol: "AAPL", time: 1, open: 10, high: 11, low: 9, close: 10.5, volume: 20 };
  socket.receive(bar);
  assert.deepEqual(barsA, [bar]);
  assert.deepEqual(barsB, [bar]);
  unsubscribeA();
  assert.equal(socket.sent.some((message) => message.action === "unsubscribe" && message.symbol === "AAPL"), false);
  unsubscribeB();
  assert.ok(socket.sent.some((message) => message.action === "unsubscribe" && message.symbol === "AAPL"));
  assert.equal(stream.status, "live");
  unsubscribeMsft();
  assert.equal(stream.status, "offline");
});

test("stream client reconnects with bounded backoff and restores wanted symbols", () => {
  MockBrowserSocket.instances = [];
  const timers = fakeTimers();
  const stream = new MarketDataStreamClient({ url: "ws://localhost:9000/api/market-data/stream", WebSocketImpl: MockBrowserSocket, timers });
  stream.subscribe("MSFT", () => {});
  const first = MockBrowserSocket.instances[0];
  first.open();
  first.close();
  const retry = [...timers.pending.entries()].find(([, timer]) => timer.delay === 1000);
  assert.ok(retry);
  timers.pending.delete(retry[0]);
  retry[1].callback();
  const second = MockBrowserSocket.instances[1];
  assert.ok(second);
  second.open();
  assert.deepEqual(second.sent, [{ action: "subscribe", symbol: "MSFT" }]);
  stream.close();
});

test("stream client rejects invalid symbols and never selects insecure ws for a secure backend", () => {
  assert.throws(() => new MarketDataStreamClient({ WebSocketImpl: MockBrowserSocket }).subscribe("AAPL/../../x", () => {}), /valid U.S. stock/);
  assert.equal(new URL("wss://to-backendapi-v1-kctb.onrender.com/api/market-data/stream").protocol, "wss:");
});
