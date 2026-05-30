/* Product detail page */
import "../css/style.css";
import { mountChrome } from "./layout.js";
import { renderGrid, addToBag } from "./ui.js";
import { getProductById, getRelated, formatPrice } from "./products.js";

mountChrome();

const root = document.querySelector("[data-product]");
const id = new URLSearchParams(window.location.search).get("id");
const product = id ? getProductById(id) : null;

if (!product) {
  root.innerHTML = `
    <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p class="eyebrow text-stone">404</p>
      <h1 class="mt-4 font-serif text-4xl font-light">This piece could not be found</h1>
      <a href="/shop.html" class="btn btn-dark mt-8">Return to the collection</a>
    </div>`;
} else {
  document.title = `${product.name} — LEBIVEST`;
  let activeSize = null;

  root.innerHTML = `
  <nav class="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pt-28 md:pt-36 pb-6 text-[0.7rem] tracking-[0.18em] uppercase text-stone">
    <a href="/index.html" class="hover:text-ink transition-colors">Maison</a>
    <span class="mx-2">/</span>
    <a href="/shop.html?category=${product.category}" class="hover:text-ink transition-colors">${product.category === "men" ? "Men" : "Women"}</a>
    <span class="mx-2">/</span>
    <span class="text-ink">${product.name}</span>
  </nav>

  <div class="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-10 lg:gap-20 pb-24">
    <!-- image -->
    <div class="lg:sticky lg:top-28 self-start">
      <div class="overflow-hidden bg-sand aspect-[3/4]">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- info -->
    <div class="lg:py-6 max-w-xl">
      ${product.badge ? `<span class="eyebrow text-gold">${product.badge}</span>` : ""}
      <h1 class="display text-4xl md:text-5xl mt-3">${product.name}</h1>
      <p class="mt-2 text-sm tracking-[0.18em] uppercase text-stone">${product.nameTr}</p>
      <p class="mt-6 font-serif text-3xl">${formatPrice(product.price)}</p>

      <p class="mt-8 text-[15px] leading-relaxed text-ink/80">${product.description}</p>

      <div class="mt-8 flex items-center justify-between">
        <span class="eyebrow">Size</span>
        <button class="text-[0.7rem] tracking-[0.18em] uppercase text-stone hover:text-ink transition-colors link-underline" data-size-guide>Size guide</button>
      </div>
      <div class="mt-3 flex flex-wrap gap-2" data-sizes>
        ${product.sizes
          .map(
            (s) =>
              `<button data-size="${s}" class="min-w-[3rem] px-3 h-11 border border-ink/20 text-sm hover:border-ink transition-colors">${s}</button>`
          )
          .join("")}
      </div>
      <p data-size-msg class="mt-2 text-[0.72rem] tracking-wide text-gold h-4"></p>

      <button data-add class="btn btn-dark w-full mt-6">Add to bag — ${formatPrice(product.price)}</button>
      <p class="mt-4 text-center text-[0.7rem] tracking-wide text-stone">Complimentary worldwide shipping & returns</p>

      <dl class="mt-10 border-t border-ink/10 divide-y divide-ink/10">
        <div class="py-4 flex justify-between gap-6 text-sm">
          <dt class="text-stone">Colour</dt><dd class="text-right">${product.color}</dd>
        </div>
        <div class="py-4 flex justify-between gap-6 text-sm">
          <dt class="text-stone">Fabric</dt><dd class="text-right">${product.fabric}</dd>
        </div>
        <div class="py-4 flex justify-between gap-6 text-sm">
          <dt class="text-stone">Details</dt>
          <dd class="text-right"><ul class="space-y-1">${product.details
            .map((d) => `<li>${d}</li>`)
            .join("")}</ul></dd>
        </div>
      </dl>
    </div>
  </div>`;

  // size select
  const sizeMsg = root.querySelector("[data-size-msg]");
  root.querySelectorAll("[data-size]").forEach((b) =>
    b.addEventListener("click", () => {
      activeSize = b.dataset.size;
      root.querySelectorAll("[data-size]").forEach((x) => x.classList.remove("bg-ink", "text-cream", "border-ink"));
      b.classList.add("bg-ink", "text-cream", "border-ink");
      if (sizeMsg) sizeMsg.textContent = "";
    })
  );

  root.querySelector("[data-size-guide]")?.addEventListener("click", () => {
    if (sizeMsg) sizeMsg.textContent = "Fits true to size. Between sizes? Take the larger.";
  });

  // add to bag (require size)
  root.querySelector("[data-add]")?.addEventListener("click", () => {
    if (!activeSize) {
      if (sizeMsg) sizeMsg.textContent = "Please select a size.";
      return;
    }
    addToBag(product.id, { size: activeSize });
  });

  // related
  const relatedEl = document.querySelector("[data-related]");
  if (relatedEl) renderGrid(relatedEl, getRelated(product, 3));
}
