(function () {
  "use strict";

  var root = document.documentElement;
  var page = root.getAttribute("data-page") || "home";
  var content = window.ORBIT_CONTENT;
  if (!content) return;

  function getPath(object, path) {
    return path.split(".").reduce(function (value, key) {
      return value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined;
    }, object);
  }

  function resolveLanguage() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get("lang");
    if (fromUrl === "en" || fromUrl === "zh") return fromUrl;
    try {
      var stored = localStorage.getItem("orbit-language") || localStorage.getItem("lang");
      if (stored === "en" || stored === "zh") return stored;
    } catch (error) { /* storage can be unavailable */ }
    return String(navigator.language || "en").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  }

  var state = { lang: resolveLanguage(), chapter: 0, filter: "all" };

  function updateLanguageLinks() {
    document.querySelectorAll('a[href$=".html"], a[href*=".html?"]').forEach(function (link) {
      try {
        var url = new URL(link.getAttribute("href"), window.location.href);
        if (url.origin !== window.location.origin && window.location.protocol !== "file:") return;
        url.searchParams.set("lang", state.lang);
        if (root.dataset.release) url.searchParams.set("v", root.dataset.release);
        link.setAttribute("href", url.pathname.split("/").pop() + "?" + url.searchParams.toString() + url.hash);
      } catch (error) { /* keep original link */ }
    });
  }

  function setDocumentMeta(strings) {
    var titleKey = page === "home" ? "homeTitle" : page + "Title";
    document.title = strings.meta[titleKey];
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", strings.meta.description);
  }

  function renderSignals(strings) {
    var list = document.querySelector("[data-signal-list]");
    if (!list) return;
    list.replaceChildren();
    strings.home.signals.forEach(function (signal) {
      var article = document.createElement("article");
      article.className = "signal-item";
      var number = document.createElement("span");
      number.className = "signal-index";
      number.textContent = signal.number;
      var title = document.createElement("h3");
      title.textContent = signal.title;
      var body = document.createElement("p");
      body.textContent = signal.body;
      article.append(number, title, body);
      list.appendChild(article);
    });
  }

  function renderFeatured(strings) {
    var container = document.querySelector("[data-featured-research]");
    if (!container) return;
    container.replaceChildren();
    content.research.filter(function (item) { return item.featured; }).forEach(function (item) {
      var link = document.createElement("a");
      link.className = "featured-card";
      link.href = "research.html?lang=" + state.lang + "#" + item.id;
      var year = document.createElement("span");
      year.className = "featured-year";
      year.textContent = item.year;
      var main = document.createElement("div");
      main.className = "featured-main";
      var title = document.createElement("h3");
      title.className = "featured-title";
      title.textContent = item.shortTitle;
      var subtitle = document.createElement("p");
      subtitle.className = "featured-subtitle";
      subtitle.textContent = item.title.split(": ").slice(1).join(": ");
      var copy = document.createElement("p");
      copy.className = "featured-copy";
      copy.textContent = item.contribution[state.lang];
      main.append(title, subtitle, copy);
      var meta = document.createElement("div");
      meta.className = "featured-meta";
      meta.textContent = item.venue[state.lang] + "\n" + item.role[state.lang];
      var figure = makeResearchFigure(item, strings);
      link.append(figure, year, main, meta);
      container.appendChild(link);
    });
  }

  function makeResearchFigure(item, strings, linkSource) {
    var figure = document.createElement("figure");
    figure.className = "research-figure";
    var image = document.createElement("img");
    image.src = item.image;
    image.alt = item.imageAlt[state.lang];
    image.loading = "lazy";
    image.width = item.imageWidth;
    image.height = item.imageHeight;
    var caption = document.createElement("figcaption");
    caption.textContent = item.imageCaption[state.lang];
    if (linkSource) {
      var source = document.createElement("a");
      source.href = item.imageSource;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = strings.research.imageSource;
      caption.append(document.createTextNode(" · "), source);
    }
    figure.append(image, caption);
    return figure;
  }

  function renderTimeline(strings) {
    document.querySelectorAll("[data-timeline]").forEach(function (container) {
      container.replaceChildren();
      strings.timeline.forEach(function (item) {
        var row = document.createElement("article");
        row.className = "trajectory-item";
        var period = document.createElement("div");
        period.className = "trajectory-period";
        period.textContent = item.period;
        var axis = document.createElement("div");
        axis.className = "trajectory-axis";
        var dot = document.createElement("span");
        dot.className = "trajectory-dot";
        axis.appendChild(dot);
        var copy = document.createElement("div");
        copy.className = "trajectory-copy";
        var place = document.createElement("div");
        place.className = "trajectory-place";
        place.textContent = item.place;
        var title = document.createElement("h3");
        title.textContent = item.title;
        var body = document.createElement("p");
        body.textContent = item.body;
        copy.append(place, title, body);
        row.append(period, axis, copy);
        container.appendChild(row);
      });
    });
  }

  function renderService(strings) {
    var list = document.querySelector("[data-service-list]");
    if (!list) return;
    list.replaceChildren();
    strings.service.forEach(function (service) {
      var item = document.createElement("li");
      item.textContent = service;
      list.appendChild(item);
    });
  }

  function researchFilterFromUrl() {
    var value = new URLSearchParams(window.location.search).get("filter") || "all";
    return ["all", "generation", "reconstruction", "vision"].indexOf(value) >= 0 ? value : "all";
  }

  function renderResearch(strings) {
    var filters = document.querySelector("[data-research-filters]");
    var list = document.querySelector("[data-research-list]");
    if (!filters || !list) return;
    var focusedFilter = document.activeElement && document.activeElement.dataset.filter;
    state.filter = researchFilterFromUrl();
    filters.replaceChildren();
    Object.keys(strings.research.filters).forEach(function (key) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button" + (state.filter === key ? " is-active" : "");
      button.textContent = strings.research.filters[key];
      button.dataset.filter = key;
      button.setAttribute("aria-pressed", String(state.filter === key));
      button.addEventListener("click", function () {
        state.filter = key;
        var url = new URL(window.location.href);
        if (key === "all") url.searchParams.delete("filter"); else url.searchParams.set("filter", key);
        url.searchParams.set("lang", state.lang);
        url.hash = "";
        history.replaceState(null, "", url);
        renderResearch(strings);
        analytics.track("research_filter", { filter: key });
      });
      filters.appendChild(button);
    });
    if (focusedFilter) {
      var replacement = filters.querySelector('[data-filter="' + focusedFilter + '"]');
      if (replacement) replacement.focus({ preventScroll: true });
    }
    list.replaceChildren();
    var visible = content.research.filter(function (item) { return state.filter === "all" || item.category === state.filter; });
    visible.forEach(function (item) {
      var record = document.createElement("article");
      record.className = "research-record";
      record.id = item.id;
      var year = document.createElement("div");
      year.className = "record-year";
      year.textContent = item.year;
      var main = document.createElement("div");
      main.className = "record-main";
      var title = document.createElement("h2");
      title.className = "record-title";
      title.textContent = item.title;
      var authors = document.createElement("p");
      authors.className = "record-authors";
      item.authors.split("Zeyang Bai").forEach(function (part, index) {
        if (index > 0) {
          var self = document.createElement("strong");
          self.textContent = "Zeyang Bai";
          authors.appendChild(self);
        }
        authors.appendChild(document.createTextNode(part));
      });
      var venue = document.createElement("p");
      venue.className = "record-venue";
      venue.textContent = item.venue[state.lang] + " · " + item.role[state.lang];
      main.append(title, authors, venue);
      var side = document.createElement("div");
      side.className = "record-side";
      var contributionGroup = document.createElement("div");
      var contributionLabel = document.createElement("span");
      contributionLabel.className = "record-label";
      contributionLabel.textContent = strings.research.contribution;
      var contribution = document.createElement("p");
      contribution.className = "record-contribution";
      contribution.textContent = item.contribution[state.lang];
      var tags = document.createElement("div");
      tags.className = "record-tags";
      item.tags.forEach(function (tag) { var span = document.createElement("span"); span.textContent = tag; tags.appendChild(span); });
      contributionGroup.append(contributionLabel, contribution, tags);
      var linkGroup = document.createElement("div");
      var linkLabel = document.createElement("span");
      linkLabel.className = "record-label";
      linkLabel.textContent = strings.research.links;
      var links = document.createElement("div");
      links.className = "record-links";
      item.links.forEach(function (resource) {
        var link = document.createElement("a");
        link.href = resource.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = resource.label;
        link.dataset.track = "research_resource";
        links.appendChild(link);
      });
      linkGroup.append(linkLabel, links);
      side.append(contributionGroup, linkGroup);
      record.append(year, makeResearchFigure(item, strings, true), main, side);
      list.appendChild(record);
    });
    var empty = document.querySelector("[data-research-empty]");
    if (empty) empty.hidden = visible.length !== 0;
    var summary = document.querySelector("[data-research-summary]");
    if (summary) summary.textContent = (visible.length === 1 ? strings.research.countOne : strings.research.count).replace("{count}", visible.length) + " · " + strings.research.authorNote;
  }

  function renderChapterRail(strings) {
    var list = document.querySelector("[data-chapter-list]");
    if (!list) return;
    list.replaceChildren();
    strings.home.chapters.forEach(function (label, index) {
      var item = document.createElement("li");
      if (index === state.chapter) item.classList.add("is-active");
      var text = document.createElement("span");
      text.textContent = label;
      var link = document.createElement("a");
      var chapter = document.querySelector('[data-chapter="' + index + '"]');
      link.href = chapter ? "#" + chapter.id : "#main";
      link.setAttribute("aria-label", label);
      link.appendChild(text);
      item.appendChild(link);
      list.appendChild(item);
    });
    updateChapterRail();
  }

  function updateChapterRail() {
    var items = document.querySelectorAll("[data-chapter-list] li");
    items.forEach(function (item, index) {
      item.classList.toggle("is-active", index === state.chapter);
      var link = item.querySelector("a");
      if (link && index === state.chapter) link.setAttribute("aria-current", "location");
      else if (link) link.removeAttribute("aria-current");
    });
    var progress = document.querySelector("[data-chapter-progress]");
    if (progress) progress.style.height = (state.chapter / 4 * 100) + "%";
    window.dispatchEvent(new CustomEvent("orbit:chapter", { detail: { chapter: state.chapter } }));
  }

  function applyLanguage(language) {
    state.lang = language;
    var strings = content[language];
    root.lang = language === "zh" ? "zh-CN" : "en";
    setDocumentMeta(strings);
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var value = getPath(strings, element.dataset.i18n);
      if (typeof value === "string") element.textContent = value;
    });
    renderSignals(strings);
    renderFeatured(strings);
    renderTimeline(strings);
    renderService(strings);
    renderResearch(strings);
    renderChapterRail(strings);
    updateLanguageLinks();
    var menuLabel = document.querySelector("[data-menu-toggle] .sr-only");
    if (menuLabel) menuLabel.textContent = document.querySelector("[data-menu-toggle]").getAttribute("aria-expanded") === "true" ? strings.common.close : strings.common.menu;
    var nav = document.querySelector("[data-nav]");
    if (nav) nav.setAttribute("aria-label", language === "zh" ? "主导航" : "Primary navigation");
    var rail = document.querySelector(".chapter-rail");
    if (rail) rail.setAttribute("aria-label", language === "zh" ? "页面章节" : "Page chapters");
    try { localStorage.setItem("orbit-language", language); } catch (error) { /* ignore */ }
    analytics.track("language_selected", { language: language });
  }

  var analytics = {
    endpoint: "",
    debug: new URLSearchParams(window.location.search).get("analytics") === "debug",
    track: function (name, properties) {
      var safe = Object.assign({
        event: name,
        page: page,
        language: state.lang,
        viewport: window.innerWidth < 760 ? "mobile" : window.innerWidth < 1100 ? "tablet" : "desktop"
      }, properties || {});
      if (this.debug && window.console) console.info("[Orbit analytics]", safe);
      if (!this.endpoint) return;
      try {
        navigator.sendBeacon(this.endpoint, new Blob([JSON.stringify(safe)], { type: "application/json" }));
      } catch (error) { /* analytics must never break the site */ }
    }
  };

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (!button || !nav) return;
    function setOpen(open, restoreFocus) {
      button.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      document.querySelector("main").inert = open;
      document.querySelector("footer").inert = open;
      button.querySelector(".sr-only").textContent = open ? content[state.lang].common.close : content[state.lang].common.menu;
      if (open) nav.querySelector("a").focus();
      else if (restoreFocus) button.focus();
    }
    button.addEventListener("click", function () { setOpen(button.getAttribute("aria-expanded") !== "true", false); });
    nav.addEventListener("click", function (event) {
      if (button.getAttribute("aria-expanded") === "true" && (event.target.closest("a") || event.target.closest("[data-language-switch]"))) setOpen(false, true);
    });
    document.addEventListener("keydown", function (event) {
      if (button.getAttribute("aria-expanded") !== "true") return;
      if (event.key === "Escape") { event.preventDefault(); setOpen(false, true); }
      if (event.key === "Tab") {
        var controls = [button].concat(Array.from(nav.querySelectorAll("a, button")));
        var position = controls.indexOf(document.activeElement);
        if (event.shiftKey && position <= 0) { event.preventDefault(); controls[controls.length - 1].focus(); }
        else if (!event.shiftKey && (position === controls.length - 1 || position < 0)) { event.preventDefault(); button.focus(); }
      }
    });
    window.matchMedia("(max-width: 760px)").addEventListener("change", function (event) { if (!event.matches) setOpen(false, false); });
  }

  function setupLanguage() {
    document.querySelectorAll("[data-language-switch]").forEach(function (button) {
      button.addEventListener("click", function () {
        var next = state.lang === "en" ? "zh" : "en";
        var url = new URL(window.location.href);
        url.searchParams.set("lang", next);
        history.replaceState(null, "", url);
        applyLanguage(next);
      });
    });
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    function update() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function setupChapters() {
    var chapters = document.querySelectorAll("[data-chapter]");
    if (!chapters.length || !("IntersectionObserver" in window)) return;
    var reached = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        state.chapter = Number(entry.target.dataset.chapter || 0);
        updateChapterRail();
        if (!reached[state.chapter]) {
          reached[state.chapter] = true;
          analytics.track("chapter_reached", { chapter: state.chapter });
        }
      });
    }, { rootMargin: "-38% 0px -45% 0px", threshold: 0 });
    chapters.forEach(function (chapter) { observer.observe(chapter); });
  }

  function setupMagnetic() {
    if (!window.matchMedia("(pointer:fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".magnetic").forEach(function (element) {
      element.addEventListener("pointermove", function (event) {
        var rect = element.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        var y = (event.clientY - rect.top - rect.height / 2) * 0.12;
        element.style.transform = "translate(" + x + "px," + y + "px)";
      });
      element.addEventListener("pointerleave", function () { element.style.transform = ""; });
    });
  }

  function setupTracking() {
    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-track]");
      if (target) analytics.track("external_action", { category: target.dataset.track });
    });
    analytics.track("page_view", { referrerHost: document.referrer ? (function(){ try { return new URL(document.referrer).hostname; } catch(e) { return ""; } })() : "" });
  }

  setupMenu();
  setupLanguage();
  setupHeader();
  setupChapters();
  setupMagnetic();
  setupTracking();
  applyLanguage(state.lang);
}());
