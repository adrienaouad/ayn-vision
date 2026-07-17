/* ==========================================================================
   AYN — article.js
   Rendu de la page article + partage WhatsApp / X (Twitter)
   Dépend de window.AynUtil défini dans main.js (chargé avant ce fichier)
   ========================================================================== */

(function () {
  "use strict";

  function showNotFound(container) {
    container.innerHTML =
      '<div class="not-found">' +
      "<h1>Article introuvable</h1>" +
      "<p>Cet article n’existe pas ou a été déplacé.</p>" +
      '<a href="index.html" class="hero-link">Retour à l’accueil →</a>' +
      "</div>";
  }

  function renderArticle(container, article) {
    const { getCategory, escapeHtml, formatDateFr, readingTime } = window.AynUtil;
    const cat = getCategory(article.categorie);

    document.title = article.titre + " — Ayn";

    const shareText = encodeURIComponent(article.titre);
    const shareUrl = encodeURIComponent(window.location.href);
    const waLink = "https://wa.me/?text=" + shareText + "%20" + shareUrl;
    const twLink = "https://twitter.com/intent/tweet?text=" + shareText + "&url=" + shareUrl;

    const tagsHtml = (article.tags || [])
      .map((t) => '<span class="tag">' + escapeHtml(t) + "</span>")
      .join("");

    const imageHtml = article.image
      ? '<img class="article-image" src="' + escapeHtml(article.image) + '" alt="' + escapeHtml(article.titre) + '">'
      : "";

    container.innerHTML =
      '<span class="article-cat" style="color:' + cat.color + '">' + escapeHtml(cat.label) + "</span>" +
      '<h1 class="article-title">' + escapeHtml(article.titre) + "</h1>" +
      '<p class="article-chapo">' + escapeHtml(article.excerpt) + "</p>" +
      '<div class="article-meta"><span>' + formatDateFr(article.date) + "</span><span>·</span><span>" +
      readingTime(article.body) + " min de lecture</span></div>" +
      imageHtml +
      '<div class="article-body">' + article.body + "</div>" +
      '<div class="article-tags">' + tagsHtml + "</div>" +
      '<div class="share-box">' +
      '<span class="share-label">Partager :</span>' +
      '<a class="share-btn share-whatsapp" href="' + waLink + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a class="share-btn share-twitter" href="' + twLink + '" target="_blank" rel="noopener">X / Twitter</a>' +
      "</div>";
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page !== "article") return;
    const container = document.getElementById("articleContainer");
    if (!container) return;

    const { fetchArticles, qs } = window.AynUtil;
    const id = qs("id");

    if (!id) {
      showNotFound(container);
      return;
    }

    fetchArticles()
      .then((articles) => {
        const article = articles.find((a) => a.id === id);
        if (!article) {
          showNotFound(container);
          return;
        }
        renderArticle(container, article);
      })
      .catch(() => showNotFound(container));
  });
})();
