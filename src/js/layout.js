/* ------------------------------------------------------------------
   LEBIVEST — shared chrome
   Injects the navigation, mobile menu, sliding bag (cart) drawer and
   footer onto every page so there is a single source of truth.
------------------------------------------------------------------ */
import { subscribe, getState, setQty, remove } from "./cart.js";
import { formatPrice } from "./products.js";

const LOGO = "/images/1780074650582.jpg";

// Orders are placed over WhatsApp (no backend on GitHub Pages).
// International format, digits only — no "+", spaces or dashes.
const WHATSAPP_NUMBER = "905521643855";

const NAV_LINKS = [
  { label: "Maison", href: "/index.html", match: ["/", "/index.html"] },
  { label: "Collection", href: "/shop.html", match: ["/shop.html"] },
  { label: "Women", href: "/shop.html?category=women" },
  { label: "Men", href: "/shop.html?category=men" },
  { label: "Atelier", href: "/about.html", match: ["/about.html"] },
];

const path = window.location.pathname.replace(/\/index\.html$/, "/");
const isActive = (link) => (link.match || []).some((m) => m === path || m === window.location.pathname);

/* ----------------------------- markup ----------------------------- */
function navMarkup() {
  const desktopLinks = NAV_LINKS.map(
    (l) =>
      `<a href="${l.href}" class="link-underline text-[0.72rem] tracking-[0.22em] uppercase ${
        isActive(l) ? "opacity-100" : "opacity-70 hover:opacity-100"
      } transition-opacity">${l.label}</a>`
  ).join("");

  return `
  <header id="site-nav" data-state="top"
    class="fixed top-0 inset-x-0 z-40 transition-all duration-500">
    <div class="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
      <div class="flex items-center justify-between h-[68px] md:h-[88px] transition-all duration-500">
        <!-- left -->
        <div class="flex items-center gap-8 flex-1">
          <button id="menu-open" aria-label="Open menu" class="md:hidden -ml-1 p-1">
            ${iconMenu()}
          </button>
          <nav class="hidden md:flex items-center gap-8">${desktopLinks.slice(0, desktopLinks.length)}</nav>
        </div>
        <!-- center wordmark -->
        <a href="/index.html" class="flex-1 text-center" aria-label="LEBIVEST home">
          <span class="font-serif tracking-[0.42em] text-lg md:text-2xl pl-[0.42em]">LEBIVEST</span>
        </a>
        <!-- right -->
        <div class="flex items-center gap-5 sm:gap-7 flex-1 justify-end">
          <a href="/shop.html" class="hidden sm:inline-block link-underline text-[0.72rem] tracking-[0.22em] uppercase opacity-70 hover:opacity-100">Search</a>
          <button id="bag-open" aria-label="Open bag" class="relative flex items-center gap-2 text-[0.72rem] tracking-[0.22em] uppercase">
            <span class="hidden sm:inline">Bag</span>
            <span class="sm:hidden">${iconBag()}</span>
            <span data-bag-count
              class="inline-flex items-center justify-center min-w-[1.2rem] h-[1.2rem] px-1 rounded-full text-[0.62rem] leading-none bg-ink text-cream data-[empty=true]:opacity-40 transition-opacity">0</span>
          </button>
        </div>
      </div>
    </div>
    <div class="h-px w-full bg-current opacity-0 transition-opacity duration-500" data-nav-rule></div>
  </header>`;
}

function menuMarkup() {
  const links = NAV_LINKS.map(
    (l, i) =>
      `<a href="${l.href}" class="block font-serif text-[2.6rem] leading-tight font-light text-cream/90 hover:text-cream transition-colors"
         style="transition-delay:${60 + i * 45}ms">${l.label}</a>`
  ).join("");
  return `
  <div id="mobile-menu" class="fixed inset-0 z-[60] md:hidden">
    <div class="menu-backdrop absolute inset-0 bg-ink/40" data-menu-close></div>
    <div class="menu-panel absolute inset-y-0 left-0 w-[84%] max-w-sm bg-ink text-cream flex flex-col">
      <div class="flex items-center justify-between h-[68px] px-5 border-b border-white/10">
        <span class="font-serif tracking-[0.42em] text-lg pl-[0.42em]">LEBIVEST</span>
        <button aria-label="Close menu" data-menu-close class="p-1">${iconClose()}</button>
      </div>
      <nav class="flex-1 px-6 py-10 flex flex-col gap-5">${links}</nav>
      <div class="px-6 py-6 border-t border-white/10 text-[0.65rem] tracking-[0.25em] uppercase text-cream/50">
        Quiet luxury · Est. 2026
      </div>
    </div>
  </div>`;
}

function drawerMarkup() {
  return `
  <div id="bag-drawer" class="fixed inset-0 z-[70] pointer-events-none">
    <div class="drawer-backdrop absolute inset-0 bg-ink/45 backdrop-blur-[2px]" data-bag-close></div>
    <aside class="drawer-panel absolute top-0 right-0 h-full w-full max-w-[440px] bg-cream text-ink flex flex-col shadow-2xl pointer-events-auto">
      <div class="flex items-center justify-between px-7 h-[88px] border-b border-ink/10">
        <h2 class="eyebrow">Your Bag <span data-bag-count-label class="text-stone normal-case tracking-normal">(0)</span></h2>
        <button aria-label="Close bag" data-bag-close class="p-1 hover:opacity-60 transition-opacity">${iconClose()}</button>
      </div>
      <div data-bag-lines class="flex-1 overflow-y-auto px-7 py-6"></div>
      <div data-bag-footer class="border-t border-ink/10 px-7 py-6 space-y-5"></div>
    </aside>
  </div>`;
}

function footerMarkup() {
  const year = new Date().getFullYear();
  return `
  <footer class="bg-ink text-cream/80 mt-px">
    <div class="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 py-20 md:py-28">
      <div class="grid gap-14 md:grid-cols-12">
        <div class="md:col-span-5">
          <span class="font-serif tracking-[0.4em] text-2xl text-cream pl-[0.4em]">LEBIVEST</span>
          <p class="mt-7 max-w-sm font-serif text-2xl leading-snug font-light text-cream/90">
            Anatolian thread, drawn into a quiet, modern line.
          </p>
          <form class="mt-9 max-w-sm" data-newsletter>
            <label class="eyebrow text-cream/50">The Maison Letter</label>
            <div class="mt-3 flex items-center border-b border-cream/30 focus-within:border-cream transition-colors">
              <input type="email" required placeholder="Email address"
                class="flex-1 bg-transparent py-3 text-sm placeholder:text-cream/40 focus:outline-none" />
              <button class="eyebrow py-3 hover:text-cream transition-colors">Join</button>
            </div>
            <p data-newsletter-msg class="mt-3 text-[0.7rem] tracking-wide text-gold-soft h-4"></p>
          </form>
        </div>
        <div class="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
          ${footerCol("Shop", [
            ["Collection", "/shop.html"],
            ["Women", "/shop.html?category=women"],
            ["Men", "/shop.html?category=men"],
            ["Signature Kilim", "/shop.html"],
          ])}
          ${footerCol("Maison", [
            ["The Atelier", "/about.html"],
            ["Craft & Kilim", "/about.html"],
            ["Sustainability", "/about.html"],
            ["Contact", "mailto:atelier@lebivest.com"],
          ])}
          ${footerCol("Client Care", [
            ["Shipping", "/about.html"],
            ["Returns", "/about.html"],
            ["Size Guide", "/about.html"],
            ["Appointments", "mailto:atelier@lebivest.com"],
          ])}
        </div>
      </div>
      <div class="mt-20 pt-8 border-t border-cream/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.66rem] tracking-[0.22em] uppercase text-cream/45">
        <span>© ${year} LEBIVEST — All rights reserved</span>
        <span class="flex gap-6">
          <a href="#" class="hover:text-cream transition-colors">Instagram</a>
          <a href="#" class="hover:text-cream transition-colors">Pinterest</a>
          <a href="#" class="hover:text-cream transition-colors">Legal</a>
        </span>
      </div>
    </div>
  </footer>`;
}

const footerCol = (title, links) => `
  <div>
    <h4 class="eyebrow text-cream/50">${title}</h4>
    <ul class="mt-5 space-y-3 text-sm">
      ${links
        .map(([l, h]) => `<li><a href="${h}" class="link-underline text-cream/75 hover:text-cream transition-colors">${l}</a></li>`)
        .join("")}
    </ul>
  </div>`;

/* ----------------------------- icons ----------------------------- */
function iconMenu() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`;
}
function iconClose() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 5l14 14M19 5L5 19"/></svg>`;
}
function iconBag() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`;
}
function iconWhatsApp() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.17 0 4.2.85 5.74 2.38a8.06 8.06 0 0 1 2.38 5.73c0 4.47-3.64 8.11-8.12 8.11a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.19-.31a8.05 8.05 0 0 1-1.24-4.27c0-4.48 3.64-8.11 8.12-8.11Zm-2.62 4.3c-.18 0-.46.07-.7.33-.24.26-.92.9-.92 2.2 0 1.3.94 2.55 1.07 2.72.13.18 1.85 2.82 4.49 3.96.63.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.55-.63 1.77-1.24.22-.61.22-1.13.15-1.24-.06-.11-.24-.18-.5-.31-.26-.13-1.55-.76-1.79-.85-.24-.09-.42-.13-.59.13-.18.26-.68.85-.83 1.02-.15.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.69-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.16.18-.27.26-.44.09-.18.04-.33-.02-.46-.07-.13-.59-1.42-.81-1.94-.21-.51-.43-.44-.59-.45h-.5Z"/></svg>`;
}

/* ----------------------------- WhatsApp order ----------------------------- */
function buildOrderMessage(state) {
  const lines = state.lines
    .map((l, i) => {
      const size = l.size ? `Beden: ${l.size}` : "Beden: Standart";
      return `${i + 1}) ${l.product.name} — ${l.product.nameTr}\n   ${size} · Adet: ${l.qty} · ${formatPrice(
        l.lineTotal
      )}`;
    })
    .join("\n\n");
  return (
    `Merhaba LEBIVEST 🤍\n` +
    `Aşağıdaki ürünler için sipariş vermek istiyorum:\n\n` +
    `${lines}\n\n` +
    `Toplam: ${state.subtotalLabel}`
  );
}

function checkoutViaWhatsApp() {
  const state = getState();
  if (state.lines.length === 0) {
    toast("Your bag is empty");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage(state))}`;
  window.open(url, "_blank", "noopener");
  toast("Opening WhatsApp to confirm your order");
}

/* ----------------------------- drawer render ----------------------------- */
function renderBag(state) {
  const linesEl = document.querySelector("[data-bag-lines]");
  const footerEl = document.querySelector("[data-bag-footer]");
  if (!linesEl || !footerEl) return;

  document.querySelectorAll("[data-bag-count]").forEach((el) => {
    el.textContent = state.count;
    el.dataset.empty = state.count === 0;
  });
  const label = document.querySelector("[data-bag-count-label]");
  if (label) label.textContent = `(${state.count})`;

  if (state.lines.length === 0) {
    linesEl.innerHTML = `
      <div class="h-full min-h-[40vh] flex flex-col items-center justify-center text-center">
        <p class="font-serif text-3xl font-light">Your bag is empty</p>
        <p class="mt-3 text-sm text-stone max-w-[15rem]">Pieces you add will rest here, waiting.</p>
        <a href="/shop.html" data-bag-close class="btn btn-dark mt-8">Explore the collection</a>
      </div>`;
    footerEl.innerHTML = "";
    return;
  }

  linesEl.innerHTML = state.lines
    .map(
      (l) => `
    <div class="flex gap-4 py-5 first:pt-0 border-b border-ink/10 last:border-b-0">
      <a href="/product.html?id=${l.id}" class="block w-20 h-28 shrink-0 overflow-hidden bg-sand">
        <img src="${l.product.image}" alt="${l.product.name}" class="w-full h-full object-cover" loading="lazy" />
      </a>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between gap-3">
          <a href="/product.html?id=${l.id}" class="text-sm font-medium leading-snug hover:opacity-60 transition-opacity">${l.product.name}</a>
          <button data-remove="${l.key}" aria-label="Remove" class="text-stone hover:text-ink transition-colors shrink-0">${iconClose()}</button>
        </div>
        <p class="mt-1 text-[0.72rem] tracking-wide uppercase text-stone">${l.product.color}${l.size ? ` · Size ${l.size}` : ""}</p>
        <div class="mt-4 flex items-center justify-between">
          <div class="inline-flex items-center border border-ink/20">
            <button data-dec="${l.key}" aria-label="Decrease" class="w-8 h-8 leading-none hover:bg-ink hover:text-cream transition-colors">–</button>
            <span class="w-8 text-center text-sm tabular-nums">${l.qty}</span>
            <button data-inc="${l.key}" aria-label="Increase" class="w-8 h-8 leading-none hover:bg-ink hover:text-cream transition-colors">+</button>
          </div>
          <span class="text-sm tabular-nums">${formatPrice(l.lineTotal)}</span>
        </div>
      </div>
    </div>`
    )
    .join("");

  footerEl.innerHTML = `
    <div class="flex items-center justify-between text-sm">
      <span class="eyebrow">Subtotal</span>
      <span class="font-serif text-2xl">${state.subtotalLabel}</span>
    </div>
    <p class="text-[0.7rem] tracking-wide text-stone">Confirm your order on WhatsApp — your selection and sizes are sent to our atelier. Complimentary worldwide shipping.</p>
    <button class="btn btn-dark w-full" data-checkout>${iconWhatsApp()} Order via WhatsApp</button>
    <button class="block w-full text-center eyebrow text-stone hover:text-ink transition-colors" data-bag-close>Continue shopping</button>`;

  linesEl.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", () => {
      const line = getState().lines.find((x) => x.key === b.dataset.inc);
      if (line) setQty(b.dataset.inc, line.qty + 1);
    })
  );
  linesEl.querySelectorAll("[data-dec]").forEach((b) =>
    b.addEventListener("click", () => {
      const line = getState().lines.find((x) => x.key === b.dataset.dec);
      if (line) setQty(b.dataset.dec, line.qty - 1);
    })
  );
  linesEl.querySelectorAll("[data-remove]").forEach((b) =>
    b.addEventListener("click", () => remove(b.dataset.remove))
  );
}

/* ----------------------------- overlays ----------------------------- */
export function openBag() {
  document.body.classList.add("drawer-open", "overlay-lock");
}
export function closeBag() {
  document.body.classList.remove("drawer-open");
  if (!document.body.classList.contains("menu-open")) document.body.classList.remove("overlay-lock");
}
function openMenu() {
  document.body.classList.add("menu-open", "overlay-lock");
}
function closeMenu() {
  document.body.classList.remove("menu-open");
  if (!document.body.classList.contains("drawer-open")) document.body.classList.remove("overlay-lock");
}

/* ----------------------------- toast ----------------------------- */
let toastTimer;
export function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className =
      "fixed z-[80] bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cream text-[0.72rem] tracking-[0.2em] uppercase px-6 py-4 opacity-0 translate-y-3 transition-all duration-500 pointer-events-none";
    document.body.appendChild(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => {
    el.classList.remove("opacity-0", "translate-y-3");
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("opacity-0", "translate-y-3"), 2400);
}

/* ----------------------------- nav scroll state ----------------------------- */
function wireNavScroll() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  const overlay = document.body.dataset.nav === "overlay";
  const rule = nav.querySelector("[data-nav-rule]");

  const apply = () => {
    const scrolled = window.scrollY > 24;
    if (overlay && !scrolled) {
      nav.style.background = "transparent";
      nav.style.color = "#ffffff";
      if (rule) rule.style.opacity = "0";
    } else {
      nav.style.background = "rgba(255,255,255,0.92)";
      nav.style.backdropFilter = "saturate(180%) blur(12px)";
      nav.style.color = "#0c0c0c";
      if (rule) rule.style.opacity = scrolled ? "0.12" : "0.08";
    }
  };
  apply();
  window.addEventListener("scroll", apply, { passive: true });
}

/* ----------------------------- scroll reveal ----------------------------- */
function wireReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ----------------------------- mount ----------------------------- */
export function mountChrome() {
  document.body.insertAdjacentHTML("afterbegin", navMarkup());
  document.body.insertAdjacentHTML("beforeend", menuMarkup() + drawerMarkup() + footerMarkup());

  // bag open/close
  document.getElementById("bag-open")?.addEventListener("click", openBag);
  document.querySelectorAll("[data-bag-close]").forEach((el) => el.addEventListener("click", closeBag));
  // delegated close for elements rendered later (checkout/continue inside footer)
  document.getElementById("bag-drawer")?.addEventListener("click", (e) => {
    if (e.target.closest("[data-bag-close]")) closeBag();
    if (e.target.closest("[data-checkout]")) {
      checkoutViaWhatsApp();
    }
  });

  // menu open/close
  document.getElementById("menu-open")?.addEventListener("click", openMenu);
  document.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", closeMenu));

  // escape closes overlays
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeBag();
      closeMenu();
    }
  });

  // newsletter (demo)
  document.querySelector("[data-newsletter]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = e.currentTarget.querySelector("[data-newsletter-msg]");
    if (msg) msg.textContent = "Welcome to the Maison. Check your inbox.";
    e.currentTarget.querySelector("input").value = "";
  });

  subscribe(renderBag);
  wireNavScroll();
  wireReveal();
}
