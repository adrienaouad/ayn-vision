/* ==========================================================================
   AYN — main.js
   Utilitaires partagés + logique page d'accueil / rubrique / recherche
   ========================================================================== */

(function () {
  "use strict";

  const CATEGORIES = {
    politique: { label: "Politique", color: "#4A8FD4" },
    economie: { label: "Économie", color: "#5A9A4A" },
    sport: { label: "Sport", color: "#D4844A" },
    culture: { label: "Culture", color: "#9A7AD4" },
    tech: { label: "Tech", color: "#4AB8A0" },
    diaspora: { label: "Diaspora", color: "#D47A9A" },
  };

  const EYE_ICON =
    '<svg class="eye-icon" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M2 30 Q50 -8 98 30 Q50 68 2 30 Z" fill="none" stroke="currentColor" stroke-width="4"/>' +
    '<circle cx="50" cy="30" r="13" fill="currentColor"/></svg>';

  let articlesPromise = null;

  function fetchArticles() {
    if (!articlesPromise) {
      articlesPromise = fetch("data/articles.json").then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les articles.");
        return res.json();
      });
    }
    return articlesPromise;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || "";
  }

  function readingTime(bodyHtml) {
    const words = stripHtml(bodyHtml).trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function formatDateFr(dateStr) {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function getCategory(slug) {
    return CATEGORIES[slug] || { label: slug || "", color: "#C4A96E" };
  }

  window.AynUtil = { CATEGORIES, fetchArticles, escapeHtml, readingTime, formatDateFr, qs, getCategory, EYE_ICON };

  /* ---------------- Rendering helpers ---------------- */

  function cardHtml(article) {
    const cat = getCategory(article.categorie);
    return (
      '<a class="card" href="article.html?id=' + encodeURIComponent(article.id) + '" style="border-top-color:' + cat.color + '">' +
      '<span class="card-cat" style="color:' + cat.color + '">' + escapeHtml(cat.label) + "</span>" +
      '<h3 class="card-title">' + escapeHtml(article.titre) + "</h3>" +
      '<p class="card-excerpt">' + escapeHtml(article.excerpt) + "</p>" +
      '<div class="card-meta"><span>' + formatDateFr(article.date) + "</span><span>·</span><span>" +
      readingTime(article.body) + " min de lecture</span></div>" +
      "</a>"
    );
  }

  function heroHtml(article) {
    const cat = getCategory(article.categorie);
    const media = article.image
      ? '<div class="hero-media"><img src="' + escapeHtml(article.image) + '" alt="' + escapeHtml(article.titre) + '"></div>'
      : '<div class="hero-media"><div class="hero-placeholder" style="--cat-color:' + cat.color + '">' + EYE_ICON + "</div></div>";

    return (
      '<div class="hero-inner-wrap">' +
      media +
      '<div class="hero-text">' +
      '<span class="hero-cat" style="color:' + cat.color + '">' + escapeHtml(cat.label) + "</span>" +
      '<h1 class="hero-title">' + escapeHtml(article.titre) + "</h1>" +
      '<p class="hero-excerpt">' + escapeHtml(article.excerpt) + "</p>" +
      '<div class="hero-meta"><span>' + formatDateFr(article.date) + "</span><span>·</span><span>" +
      readingTime(article.body) + ' min de lecture</span></div>' +
      '<a class="hero-link" href="article.html?id=' + encodeURIComponent(article.id) + '">Lire l’article →</a>' +
      "</div></div>"
    );
  }

  function matchesQuery(article, q) {
    const inTitle = article.titre.toLowerCase().includes(q);
    const inTags = (article.tags || []).some((t) => t.toLowerCase().includes(q));
    return inTitle || inTags;
  }

  /* ---------------- Home page ---------------- */

  function initHomePage() {
    if (document.body.dataset.page !== "home") return;
    const heroEl = document.getElementById("hero");
    const gridEl = document.getElementById("grid");
    if (!heroEl || !gridEl) return;

    fetchArticles()
      .then((articles) => {
        const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
        window.__aynArticles = sorted;
        const initialQuery = qs("q") || "";
        const searchInput = document.getElementById("searchInput");
        if (searchInput && initialQuery) searchInput.value = initialQuery;
        renderHome(sorted, initialQuery);
      })
      .catch((err) => {
        gridEl.innerHTML = '<p class="error-msg">' + escapeHtml(err.message) + "</p>";
      });
  }

  function renderHome(articles, query) {
    const heroEl = document.getElementById("hero");
    const gridEl = document.getElementById("grid");
    const headingEl = document.getElementById("gridHeading");
    const q = (query || "").trim().toLowerCase();

    if (!q) {
      const first = articles[0];
      const rest = articles.slice(1);
      heroEl.style.display = "";
      heroEl.innerHTML = first ? heroHtml(first) : "";
      if (headingEl) headingEl.textContent = "Derniers articles";
      gridEl.innerHTML = rest.length
        ? rest.map(cardHtml).join("")
        : '<p class="empty-msg">Aucun article pour le moment.</p>';
      return;
    }

    const filtered = articles.filter((a) => matchesQuery(a, q));
    heroEl.style.display = "none";
    heroEl.innerHTML = "";
    if (headingEl) headingEl.textContent = "Résultats pour « " + query + " »";
    gridEl.innerHTML = filtered.length
      ? filtered.map(cardHtml).join("")
      : '<p class="empty-msg">Aucun article ne correspond à votre recherche.</p>';
  }

  /* ---------------- Category page ---------------- */

  function initCategoryPage() {
    if (document.body.dataset.page !== "categorie") return;
    const gridEl = document.getElementById("grid");
    const headerEl = document.getElementById("categoryHeader");
    if (!gridEl || !headerEl) return;

    const cat = qs("cat");
    const catInfo = CATEGORIES[cat];

    if (!catInfo) {
      headerEl.innerHTML = "<h1>Rubrique introuvable</h1><p class=\"category-count\"><a href=\"index.html\">Retour à l’accueil →</a></p>";
      gridEl.innerHTML = "";
      return;
    }

    fetchArticles()
      .then((articles) => {
        const filtered = articles
          .filter((a) => a.categorie === cat)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        window.__aynArticles = filtered;

        headerEl.innerHTML =
          '<h1 style="color:' + catInfo.color + '">' + escapeHtml(catInfo.label) + "</h1>" +
          '<p class="category-count">' + filtered.length + (filtered.length > 1 ? " articles" : " article") + "</p>";
        document.title = catInfo.label + " — Ayn";

        const initialQuery = qs("q") || "";
        const searchInput = document.getElementById("searchInput");
        if (searchInput && initialQuery) searchInput.value = initialQuery;
        renderCategoryGrid(filtered, initialQuery);
      })
      .catch((err) => {
        gridEl.innerHTML = '<p class="error-msg">' + escapeHtml(err.message) + "</p>";
      });
  }

  function renderCategoryGrid(articles, query) {
    const gridEl = document.getElementById("grid");
    const q = (query || "").trim().toLowerCase();
    const list = q ? articles.filter((a) => matchesQuery(a, q)) : articles;
    gridEl.innerHTML = list.length
      ? list.map(cardHtml).join("")
      : '<p class="empty-msg">Aucun article ne correspond à votre recherche.</p>';
  }

  /* ---------------- Search ---------------- */

  function initSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const page = document.body.dataset.page;

    if (page === "home" || page === "categorie") {
      input.addEventListener("input", () => {
        const articles = window.__aynArticles || [];
        if (page === "home") renderHome(articles, input.value);
        else renderCategoryGrid(articles, input.value);
      });
    } else {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = input.value.trim();
          window.location.href = "index.html" + (val ? "?q=" + encodeURIComponent(val) : "");
        }
      });
    }
  }

  /* ---------------- Mobile nav toggle ---------------- */

  function initNavToggle() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.classList.toggle("active", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ---------------- Active nav link highlight ---------------- */

  function highlightActiveNav() {
    const cat = qs("cat");
    if (!cat) return;
    document.querySelectorAll(".nav-link[data-cat]").forEach((link) => {
      if (link.dataset.cat === cat) link.classList.add("active");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavToggle();
    highlightActiveNav();
    initSearch();
    initHomePage();
    initCategoryPage();
  });
})();
