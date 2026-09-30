import { MARKET_DATA_STREAM_URL } from "./marketDataConfig.js";

const MAX_CLIENT_RETRIES = 8;

export class MarketDataStreamClient {
  constructor({ url = MARKET_DATA_STREAM_URL, WebSocketImpl = globalThis.WebSocket, timers = globalThis } = {}) {
    this.url = url;
    this.WebSocketImpl = WebSocketImpl;
    this.timers = timers;
    this.socket = null;
    this.status = "offline";
    this.listeners = new Map();
    this.statusListeners = new Set();
    this.symbolCounts = new Map();
    this.subscribedSymbols = new Set();
    this.retryTimer = null;
    this.retryCount = 0;
    this.manualClose = false;
  }

  setStatus(status, message) {
    this.status = status;
    for (const callback of this.statusListeners) callback({ status, ...(message ? { message } : {}) });
  }

  subscribeStatus(callback) {
    this.statusListeners.add(callback);
    callback({ status: this.status });
    return () => this.statusListeners.delete(callback);
  }

  subscribe(symbol, onBar) {
    const cleanSymbol = String(symbol || "").trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9.-]{0,14}$/.test(cleanSymbol) || cleanSymbol.includes("..") || cleanSymbol.endsWith(".")) {
      throw new Error("Enter a valid U.S. stock symbol.");
    }
    const id = Symbol(cleanSymbol);
    this.listeners.set(id, { symbol: cleanSymbol, onBar });
    const count = (this.symbolCounts.get(cleanSymbol) || 0) + 1;
    this.symbolCounts.set(cleanSymbol, count);
    if (count === 1) {
      this.manualClose = false;
      if (this.socket?.readyState === this.WebSocketImpl.OPEN) this.send({ action: "subscribe", symbol: cleanSymbol });
      else this.connect();
    }
    return () => this.unsubscribe(id);
  }

  unsubscribe(id) {
    const listener = this.listeners.get(id);
    if (!listener) return;
    this.listeners.delete(id);
    const count = (this.symbolCounts.get(listener.symbol) || 1) - 1;
    if (count <= 0) {
      this.symbolCounts.delete(listener.symbol);
      this.subscribedSymbols.delete(listener.symbol);
      if (this.socket?.readyState === this.WebSocketImpl.OPEN) this.send({ action: "unsubscribe", symbol: listener.symbol });
    } else this.symbolCounts.set(listener.symbol, count);
    if (this.listeners.size === 0) this.close();
  }

  connect() {
    if (!this.WebSocketImpl || this.socket || this.listeners.size === 0) {
      if (!this.WebSocketImpl) this.setStatus("offline", "WebSocket is unavailable in this browser.");
      return;
    }
    this.manualClose = false;
    this.setStatus(this.retryCount ? "reconnecting" : "connecting");
    let socket;
    try { socket = new this.WebSocketImpl(this.url); } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;
    socket.addEventListener("open", () => {
      if (this.socket !== socket) return;
      this.retryCount = 0;
      this.setStatus("connecting");
      for (const symbol of this.symbolCounts.keys()) this.send({ action: "subscribe", symbol });
    });
    socket.addEventListener("message", (event) => this.handleMessage(event.data));
    socket.addEventListener("error", () => {});
    socket.addEventListener("close", () => {
      if (this.socket === socket) this.socket = null;
      this.subscribedSymbols.clear();
      if (!this.manualClose && this.listeners.size) this.scheduleReconnect();
      else this.setStatus("offline");
    });
  }

  handleMessage(raw) {
    let message;
    try { message = JSON.parse(String(raw)); } catch { return; }
    if (message.type === "status") {
      const status = message.status === "error" ? "offline" : message.status;
      this.setStatus(status, message.message);
    } else if (message.type === "subscribed" && this.symbolCounts.has(message.symbol)) {
      this.subscribedSymbols.add(message.symbol);
      if (this.status !== "live") this.setStatus("connected");
    } else if (message.type === "minute_bar" && this.subscribedSymbols.has(message.symbol)) {
      this.setStatus("live");
      for (const listener of this.listeners.values()) if (listener.symbol === message.symbol) listener.onBar(message);
    } else if (message.type === "error") {
      this.setStatus("offline", message.error || "Realtime data is unavailable.");
    }
  }

  send(payload) {
    if (this.socket?.readyState === this.WebSocketImpl.OPEN) this.socket.send(JSON.stringify(payload));
  }

  scheduleReconnect() {
    if (this.retryTimer || this.manualClose || this.listeners.size === 0) return;
    if (this.retryCount >= MAX_CLIENT_RETRIES) {
      this.setStatus("offline", "Realtime connection could not be restored.");
      return;
    }
    this.setStatus("reconnecting");
    const delay = Math.min(1000 * 2 ** this.retryCount, 30000);
    this.retryCount += 1;
    this.retryTimer = this.timers.setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, delay);
  }

  close() {
    this.manualClose = true;
    if (this.retryTimer) this.timers.clearTimeout(this.retryTimer);
    this.retryTimer = null;
    const socket = this.socket;
    this.socket = null;
    this.subscribedSymbols.clear();
    if (socket && socket.readyState < this.WebSocketImpl.CLOSING) socket.close();
    this.setStatus("offline");
  }
}

const marketDataStream = new MarketDataStreamClient();
export default marketDataStream;
