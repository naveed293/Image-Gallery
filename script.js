/* ============================================================
   Lumina Gallery — CodeAlpha Frontend Internship · Task 1
   Features: responsive grid, category filters (bonus), search,
   lightbox with prev/next + keyboard + swipe, lazy loading,
   dark mode, load-more pagination.
   ============================================================ */

/* ---------- Photo data (Unsplash) ---------- */
const PHOTOS = [
  { id: 1,  title: "Autumn Forest Path",   category: "Nature",    url: "photo-1441974231531-c6227db76b6e" },
  { id: 2,  title: "Mountain Lake Mirror", category: "Mountains", url: "photo-1501785888041-af3ef285b470" },
  { id: 3,  title: "City Lights at Dusk",  category: "Cities",    url: "photo-1514565131-fce0801e5785" },
  { id: 4,  title: "Ocean Wave Crest",     category: "Oceans",    url: "photo-1505118380757-91f5f5632de0" },
  { id: 5,  title: "Desert Dunes",         category: "Nature",    url: "photo-1473580044384-7ba9967e16a0" },
  { id: 6,  title: "Snowy Peak Sunrise",   category: "Mountains", url: "photo-1454496522488-7a8e488e8606" },
  { id: 7,  title: "Neon Tokyo Streets",   category: "Cities",    url: "photo-1540959733332-eab4deabeeaf" },
  { id: 8,  title: "Tropical Turquoise Sea", category: "Oceans",  url: "photo-1507525428034-b723cf961d3e" },
  { id: 9,  title: "Misty Pine Valley",    category: "Mountains", url: "photo-1441716844725-09cedc13a4e8" },
  { id: 10, title: "Golden Wheat Field",   category: "Nature",    url: "photo-1500382017468-9049fed747ef" },
  { id: 11, title: "Parisian Evening",     category: "Cities",    url: "photo-1502602898657-3e91760cbb34" },
  { id: 12, title: "Coral Reef Dive",      category: "Oceans",    url: "photo-1544550581-5f7ceaf7f992" },
  { id: 13, title: "Lavender Bloom",       category: "Nature",    url: "photo-1499002238440-d264edd596ec" },
  { id: 14, title: "Alpine Cabin",         category: "Mountains", url: "photo-1518780664697-55e3ad937233" },
  { id: 15, title: "Manhattan Skyline",    category: "Cities",    url: "photo-1496442226666-8d4d0e62e6e9" },
  { id: 16, title: "Sailboat at Sunset",   category: "Oceans",    url: "photo-1500930287596-c1ecaa373bb2" },
];

const img = (photo, w) =>
  `https://images.unsplash.com/${photo.url}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORIES = ["All", ...new Set(PHOTOS.map(p => p.category))];
const PAGE_SIZE = 8;

/* ---------- State ---------- */
let activeCategory = "All";
let searchTerm = "";
let visibleCount = PAGE_SIZE;
let lightboxIndex = -1;

/* ---------- DOM refs ---------- */
const grid        = document.getElementById("galleryGrid");
const filterBar   = document.getElementById("filterBar");
const resultCount = document.getElementById("resultCount");
const emptyState  = document.getElementById("emptyState");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMoreWrap= loadMoreBtn.parentElement;
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const resetFilters= document.getElementById("resetFilters");

/* ---------- Filtering ---------- */
function getFilteredPhotos() {
  return PHOTOS.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = !searchTerm ||
      p.title.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

/* ---------- Render ---------- */
function renderFilterBar() {
  filterBar.innerHTML = CATEGORIES.map(cat => `
    <button class="filter-btn${cat === activeCategory ? " active" : ""}"
            data-category="${cat}"
            aria-pressed="${cat === activeCategory}">${cat}</button>
  `).join("");
}

function renderGrid() {
  const filtered = getFilteredPhotos();
  const visible  = filtered.slice(0, visibleCount);

  grid.innerHTML = visible.map((photo, i) => `
    <button class="gallery-item" data-id="${photo.id}" style="animation-delay:${i * 60}ms"
            aria-label="View ${photo.title} in lightbox">
      <img src="${img(photo, 600)}" alt="${photo.title}" loading="lazy" width="600" height="450" />
      <span class="item-zoom"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
      <span class="item-overlay">
        <h3>${photo.title}</h3>
        <span>${photo.category}</span>
      </span>
    </button>
  `).join("");

  // Count, empty state and load-more visibility
  resultCount.textContent = filtered.length === 0
    ? ""
    : `Showing ${visible.length} of ${filtered.length} photo${filtered.length !== 1 ? "s" : ""}${activeCategory !== "All" ? ` in “${activeCategory}”` : ""}`;

  emptyState.hidden = filtered.length !== 0;
  grid.style.display = filtered.length === 0 ? "none" : "grid";
  loadMoreWrap.style.display = visible.length < filtered.length ? "flex" : "none";
}

function renderAll() {
  renderFilterBar();
  renderGrid();
}

/* ---------- Filter/search events ---------- */
filterBar.addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  visibleCount = PAGE_SIZE;
  renderAll();
});

searchInput.addEventListener("input", e => {
  searchTerm = e.target.value.trim().toLowerCase();
  clearSearch.hidden = !searchTerm;
  visibleCount = PAGE_SIZE;
  renderGrid();
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  searchTerm = "";
  clearSearch.hidden = true;
  renderGrid();
  searchInput.focus();
});

resetFilters.addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  searchInput.value = "";
  clearSearch.hidden = true;
  visibleCount = PAGE_SIZE;
  renderAll();
});

loadMoreBtn.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  renderGrid();
});

/* ============ Lightbox ============ */
const lightbox  = document.getElementById("lightbox");
const lbImage   = document.getElementById("lbImage");
const lbTitle   = document.getElementById("lbTitle");
const lbCategory= document.getElementById("lbCategory");
const lbCounter = document.getElementById("lbCounter");
const lbLoader  = document.getElementById("lbLoader");
const lbClose   = document.getElementById("lbClose");
const lbPrev    = document.getElementById("lbPrev");
const lbNext    = document.getElementById("lbNext");
const toast     = document.getElementById("toast");

let lastFocused = null;

function currentList() {
  // Lightbox navigates within the currently filtered set
  return getFilteredPhotos();
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateLightbox(direction = 0) {
  const list = currentList();
  if (!list.length) return;
  lightboxIndex = (lightboxIndex + list.length) % list.length;
  const photo = list[lightboxIndex];

  lbLoader.classList.add("active");
  lbImage.classList.add("loading");

  const full = new Image();
  full.onload = () => {
    lbImage.src = full.src;
    lbImage.alt = photo.title;
    lbLoader.classList.remove("active");
    lbImage.classList.remove("loading");
  };
  full.onerror = () => {
    lbLoader.classList.remove("active");
    lbImage.classList.remove("loading");
    showToast("Couldn't load image — check your connection");
  };
  full.src = img(photo, 1600);

  lbTitle.textContent = photo.title;
  lbCategory.textContent = photo.category;
  lbCounter.textContent = `${lightboxIndex + 1} / ${list.length}`;
}

function openLightbox(photoId) {
  const list = currentList();
  lightboxIndex = list.findIndex(p => p.id === photoId);
  if (lightboxIndex === -1) return;

  lastFocused = document.activeElement;
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("visible"));
  document.body.style.overflow = "hidden";
  updateLightbox();
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("visible");
  document.body.style.overflow = "";
  setTimeout(() => { lightbox.hidden = true; }, 250);
  if (lastFocused) lastFocused.focus();
}

function step(delta) {
  lightboxIndex += delta;
  updateLightbox(delta);
}

grid.addEventListener("click", e => {
  const item = e.target.closest(".gallery-item");
  if (item) openLightbox(Number(item.dataset.id));
});

lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => step(-1));
lbNext.addEventListener("click", () => step(1));

// Click backdrop (outside image) to close
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener("keydown", e => {
  if (lightbox.hidden) return;
  switch (e.key) {
    case "Escape":     closeLightbox(); break;
    case "ArrowLeft":  step(-1); break;
    case "ArrowRight": step(1);  break;
  }
});

// Swipe support for touch devices
let touchStartX = null;
lightbox.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
  touchStartX = null;
}, { passive: true });

/* ============ Theme toggle ============ */
const themeToggle = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  localStorage.setItem("lumina-theme", theme);
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});
applyTheme(localStorage.getItem("lumina-theme") || (prefersDark.matches ? "dark" : "light"));

/* ============ Mobile nav ============ */
const hamburger = document.getElementById("hamburger");
const nav       = document.getElementById("nav");

hamburger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  hamburger.classList.toggle("active", open);
  hamburger.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", e => {
  if (e.target.classList.contains("nav-link")) {
    nav.classList.remove("open");
    hamburger.classList.remove("active");
  }
});

/* ============ Animated hero stats + init ============ */
function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  // Fallback: ensure final value even if rAF is throttled (hidden tab)
  setTimeout(() => { el.textContent = target; }, duration + 100);
  requestAnimationFrame(tick);
}

animateCount(document.getElementById("statImages"), PHOTOS.length);
animateCount(document.getElementById("statCategories"), CATEGORIES.length - 1);

renderAll();
