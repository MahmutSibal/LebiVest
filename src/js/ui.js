/* ------------------------------------------------------------------
   LEBIVEST — shared UI fragments
------------------------------------------------------------------ */
import { formatPrice } from "./products.js";
import { add } from "./cart.js";
import { openBag, toast } from "./layout.js";

/** A single product card for the grids. */
export function productCard(p, { reveal = true } = {}) {
  return `
  <article class="product-card group ${reveal ? "reveal" : ""}">
    <a href="/product.html?id=${p.id}" class="block relative overflow-hidden bg-sand aspect-[3/4]">
      <img src="${p.image}" alt="${p.name}" loading="lazy"
        class="img-zoom absolute inset-0 w-full h-full object-cover" />
      ${p.badge ? `<span class="absolute top-4 left-4 eyebrow bg-cream/90 text-ink px-3 py-1.5">${p.badge}</span>` : ""}
      <button data-quick-add="${p.id}"
        class="absolute bottom-4 inset-x-4 btn btn-light bg-cream/95 border-cream/95 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
        Add to bag
      </button>
    </a>
    <div class="pt-5 flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-medium leading-snug">
          <a href="/product.html?id=${p.id}" class="link-underline">${p.name}</a>
        </h3>
        <p class="mt-1 text-[0.72rem] tracking-[0.18em] uppercase text-stone">${p.nameTr}</p>
      </div>
      <span class="text-sm tabular-nums shrink-0">${formatPrice(p.price)}</span>
    </div>
  </article>`;
}

/** Render a list of products into a container and wire quick-add. */
export function renderGrid(container, list, options) {
  container.innerHTML = list.map((p) => productCard(p, options)).join("");
  container.querySelectorAll("[data-quick-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      addToBag(btn.dataset.quickAdd);
    });
  });
}

/** Add by id (default size) and surface the bag. */
export function addToBag(id, opts = {}) {
  add(id, opts);
  toast("Added to your bag");
  openBag();
}
