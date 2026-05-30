/* Collection / shop page */
import "../css/style.css";
import { mountChrome } from "./layout.js";
import { renderGrid } from "./ui.js";
import { products, getByCategory } from "./products.js";

mountChrome();

const grid = document.querySelector("[data-grid]");
const countEl = document.querySelector("[data-count]");
const titleEl = document.querySelector("[data-shop-title]");
const lineBar = document.querySelector("[data-lines]");
const sortSel = document.querySelector("[data-sort]");
const catBar = document.querySelector("[data-cats]");

const params = new URLSearchParams(window.location.search);
const state = {
  category: params.get("category") || "all",
  line: params.get("line") || "all",
  sort: params.get("sort") || "featured",
};

const TITLES = { all: "The Collection", women: "Women", men: "Men" };

function lines(category) {
  const base = getByCategory(category);
  return ["all", ...Array.from(new Set(base.map((p) => p.line)))];
}

function apply() {
  let list = getByCategory(state.category);
  if (state.line !== "all") list = list.filter((p) => p.line === state.line);

  if (state.sort === "price-asc") list = list.slice().sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);

  renderGrid(grid, list, { reveal: false });
  if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? "piece" : "pieces"}`;
  if (titleEl) titleEl.textContent = TITLES[state.category] || "The Collection";

  // refresh URL without reload
  const u = new URLSearchParams();
  if (state.category !== "all") u.set("category", state.category);
  if (state.line !== "all") u.set("line", state.line);
  if (state.sort !== "featured") u.set("sort", state.sort);
  const qs = u.toString();
  history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

function chip(label, active, value, attr) {
  return `<button data-${attr}="${value}" class="eyebrow px-4 py-2 border transition-colors ${
    active ? "bg-ink text-cream border-ink" : "border-ink/20 text-stone hover:border-ink hover:text-ink"
  }">${label}</button>`;
}

function renderCats() {
  if (!catBar) return;
  const cats = [
    ["all", "All"],
    ["women", "Women"],
    ["men", "Men"],
  ];
  catBar.innerHTML = cats.map(([v, l]) => chip(l, state.category === v, v, "cat")).join("");
  catBar.querySelectorAll("[data-cat]").forEach((b) =>
    b.addEventListener("click", () => {
      state.category = b.dataset.cat;
      state.line = "all";
      renderCats();
      renderLines();
      apply();
    })
  );
}

function renderLines() {
  if (!lineBar) return;
  const ls = lines(state.category);
  if (ls.length <= 2) {
    lineBar.innerHTML = "";
    return;
  }
  lineBar.innerHTML = ls
    .map((l) => chip(l === "all" ? "Everything" : l, state.line === l, l, "line"))
    .join("");
  lineBar.querySelectorAll("[data-line]").forEach((b) =>
    b.addEventListener("click", () => {
      state.line = b.dataset.line;
      renderLines();
      apply();
    })
  );
}

if (sortSel) {
  sortSel.value = state.sort;
  sortSel.addEventListener("change", () => {
    state.sort = sortSel.value;
    apply();
  });
}

renderCats();
renderLines();
apply();
