/* Home page */
import "../css/style.css";
import { mountChrome } from "./layout.js";
import { renderGrid } from "./ui.js";
import { featured, getByCategory } from "./products.js";

mountChrome();

const featuredEl = document.querySelector("[data-featured]");
if (featuredEl) renderGrid(featuredEl, featured());

const railEl = document.querySelector("[data-rail]");
if (railEl) renderGrid(railEl, getByCategory("women").slice(0, 6));
