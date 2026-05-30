/* ------------------------------------------------------------------
   LEBIVEST — cart store
   Client-side only. Persisted to localStorage. Pub/sub so the nav
   count and drawer stay in sync across every page.
------------------------------------------------------------------ */
import { getProductById, formatPrice } from "./products.js";

const STORAGE_KEY = "lebivest.bag.v1";
const listeners = new Set();

const lineId = (id, size) => `${id}::${size || "—"}`;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let items = load();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
  listeners.forEach((fn) => fn(getState()));
}

/** Decorate stored lines with live product data. */
function hydrate(line) {
  const product = getProductById(line.id);
  if (!product) return null;
  return {
    key: lineId(line.id, line.size),
    id: line.id,
    size: line.size,
    qty: line.qty,
    product,
    lineTotal: product.price * line.qty,
  };
}

export function getState() {
  const lines = items.map(hydrate).filter(Boolean);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  return { lines, count, subtotal, subtotalLabel: formatPrice(subtotal) };
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(getState());
  return () => listeners.delete(fn);
}

export function add(id, { size = null, qty = 1 } = {}) {
  const product = getProductById(id);
  if (!product) return;
  const existing = items.find((l) => l.id === id && l.size === size);
  if (existing) existing.qty += qty;
  else items.push({ id, size, qty });
  persist();
}

export function setQty(key, qty) {
  const next = Math.max(0, qty);
  items = items
    .map((l) => (lineId(l.id, l.size) === key ? { ...l, qty: next } : l))
    .filter((l) => l.qty > 0);
  persist();
}

export function remove(key) {
  items = items.filter((l) => lineId(l.id, l.size) !== key);
  persist();
}

export function clear() {
  items = [];
  persist();
}

// Keep multiple tabs in sync.
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    items = load();
    listeners.forEach((fn) => fn(getState()));
  }
});
