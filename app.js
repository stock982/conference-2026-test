(function () {
  const defaults = window.CONFERENCE_SITE_DATA;
  const saved = localStorage.getItem("conferenceSiteData");
  const savedData = saved ? JSON.parse(saved) : null;
  let data = savedData && savedData.site && savedData.site.version === defaults.site.version ? savedData : defaults;
  let lang = "zh";
  let page = "home";
  let section = "";

  const main = document.querySelector("#main");
  const nav = document.querySelector("#site-nav");
  const footerLinks = document.querySelector("#footer-links");
  const menuButton = document.querySelector(".menu-button");

  function t(pageId) {
    return data.pages[lang][pageId] || data.pages[lang].home;
  }

  function setRoute() {
    const parts = location.hash.replace("#/", "").split("/").filter(Boolean);
    lang = data.languages[parts[0]] ? parts[0] : "zh";
    page = data.pages[lang][parts[1]] ? parts[1] : "home";
    section = parts[2] || "";
  }

  function linkTo(pageId, nextLang = lang) {
    return `#/${nextLang}/${pageId}`;
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderActions(actions = []) {
    if (!actions.length) return "";
    return `<div class="actions">${actions
      .map((action) => {
        const href = action.page ? linkTo(action.page) : action.urlKey ? data.site[action.urlKey] : action.url;
        const externalAttrs = /^https?:\/\//.test(href || "") ? ` target="_blank" rel="noopener noreferrer"` : "";
        return `<a class="button ${action.style || "secondary"}" href="${escapeHTML(href)}"${externalAttrs}>${escapeHTML(action.label)}</a>`;
      })
      .join("")}</div>`;
  }

  function renderLinkedItem(item) {
    if (typeof item === "string") return escapeHTML(item);
    const href = item.url || "#";
    const externalAttrs = /^https?:\/\//.test(href) ? ` target="_blank" rel="noopener noreferrer"` : "";
    return `<a href="${escapeHTML(href)}"${externalAttrs}>${escapeHTML(item.label)}</a>`;
  }

  function renderGroupGrid(groups) {
    if (!groups || !groups.length) return "";
    return `<div class="people-groups">${groups
      .map(
        (group) => `<section>
          <h2>${escapeHTML(group.title)}</h2>
          ${group.subgroups
            ? `<div class="subgroup-list">${group.subgroups
              .map(
                (subgroup) => `<article>
                    <h3>${escapeHTML(subgroup.title)}</h3>
                    <ul>${subgroup.people.map((person) => `<li>${renderLinkedItem(person)}</li>`).join("")}</ul>
                  </article>`
              )
              .join("")}</div>`
            : `<ul>${group.people.map((person) => `<li>${renderLinkedItem(person)}</li>`).join("")}</ul>`}
        </section>`
      )
      .join("")}</div>`;
  }

  function renderSectionImageSet(section) {
    const sectionImages = section.images || (section.image ? [section.image] : []);
    if (!sectionImages.length) return "";
    return `<div class="section-images">${sectionImages
      .map(
        (image) => `<figure class="section-image">
          <a href="${escapeHTML(image.src)}" ${image.enlarge ? `target="_blank" rel="noopener noreferrer"` : ""}>
            <img src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt || section.title)}" loading="lazy" />
          </a>
          ${image.caption ? `<figcaption>${escapeHTML(image.caption)}</figcaption>` : ""}
        </figure>`
      )
      .join("")}</div>`;
  }

  function renderEventBlocks(blocks, title) {
    if (!blocks || !blocks.length) return "";
    const nav = `<nav class="section-anchor-nav" aria-label="${escapeHTML(title)} featured sections">${blocks
      .map((item, index) => `<button type="button" data-section-target="showcase-${index + 1}">${escapeHTML(item.title)}</button>`)
      .join("")}</nav>`;
    const body = `<div class="event-blocks">${blocks
      .map((item, index) => {
        if (item.type === "simple") {
          return `<article id="showcase-${index + 1}" class="showcase-card">
            <div class="showcase-visual"><span>${escapeHTML(item.label)}</span></div>
            <div>
              <h2>${escapeHTML(item.title)}</h2>
              ${item.text ? `<p>${escapeHTML(item.text)}</p>` : ""}
              ${item.meta ? `<small>${escapeHTML(item.meta)}</small>` : ""}
              ${renderActions(item.actions)}
            </div>
          </article>`;
        }
        return `<section id="showcase-${index + 1}" class="event-feature">
          <article class="event-feature-hero">
            <div class="showcase-visual"><span>${escapeHTML(item.label)}</span></div>
            <div>
              <h2>${escapeHTML(item.title)}</h2>
              ${item.text ? `<p>${escapeHTML(item.text)}</p>` : ""}
              ${item.meta ? `<small>${escapeHTML(item.meta)}</small>` : ""}
            </div>
          </article>
          ${renderGroupGrid(item.groups)}
          ${item.sections
            ? `<div class="info-sections">${item.sections
              .map((section) => `<section class="${section.layout === "poster" ? "poster-section" : ""}">
                    <h2>${escapeHTML(section.title)}</h2>
                    ${section.text ? `<p>${escapeHTML(section.text)}</p>` : ""}
                    ${renderSectionImageSet(section)}
                  </section>`)
              .join("")}</div>`
            : ""
          }
        </section>`;
      })
      .join("")}</div>`;
    return `${nav}${body}`;
  }

  function renderCommonContent(content) {
    const body = content.body && content.body.length
      ? `<div class="prose">${content.body.map((item) => `<p>${escapeHTML(item)}</p>`).join("")}</div>`
      : "";
    const topics = content.topics
      ? `<ol class="topic-grid">${content.topics.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ol>`
      : "";
    const groups = renderGroupGrid(content.groups);
    const eventBlocks = renderEventBlocks(content.eventBlocks, content.title);
    const showcase = !eventBlocks && content.showcase
      ? `${content.showcaseAnchors
        ? `<nav class="section-anchor-nav" aria-label="${escapeHTML(content.title)} featured sections">${content.showcase
          .map((item, index) => `<button type="button" data-section-target="showcase-${index + 1}">${escapeHTML(item.title)}</button>`)
          .join("")}</nav>`
        : ""}<div class="showcase-grid">${content.showcase
          .map(
            (item, index) => `<article id="showcase-${index + 1}" class="showcase-card">
              <div class="showcase-visual"><span>${escapeHTML(item.label)}</span></div>
              <div>
                <h2>${escapeHTML(item.title)}</h2>
                ${item.text ? `<p>${escapeHTML(item.text)}</p>` : ""}
                ${item.meta ? `<small>${escapeHTML(item.meta)}</small>` : ""}
                ${renderActions(item.actions)}
                ${item.groups
                ? `<div class="embedded-groups">${item.groups
                  .map(
                    (group) => `<section>
                          <h3>${escapeHTML(group.title)}</h3>
                          <ul>${group.people.map((person) => `<li>${renderLinkedItem(person)}</li>`).join("")}</ul>
                        </section>`
                  )
                  .join("")}</div>`
                : ""}
                ${item.sections
                ? `<div class="embedded-sections">${item.sections
                  .map((section) => `<section><h3>${escapeHTML(section.title)}</h3>${section.text ? `<p>${escapeHTML(section.text)}</p>` : ""}</section>`)
                  .join("")}</div>`
                : ""}
              </div>
            </article>`
          )
          .join("")}</div>`
      : "";
    const announcements = content.announcements
      ? `<div class="notice-list">${content.announcements
        .map((item) => `<article><time>${escapeHTML(item.date)}</time><p>${escapeHTML(item.text)}</p></article>`)
        .join("")}</div>`
      : "";
    const timeline = content.timeline
      ? `<div class="timeline">${content.timeline
        .map(
          (item) => `<article><time>${escapeHTML(item.date)}</time><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.text)}</p></article>`
        )
        .join("")}</div>`
      : "";
    const schedule = content.schedule
      ? `<div class="schedule">${content.schedule
        .map(
          (item) => `<article><time>${escapeHTML(item.time)}</time><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.room)}</span></article>`
        )
        .join("")}</div>`
      : "";
    const sections = content.sections
      ? `${content.sectionAnchors
        ? `<nav class="section-anchor-nav" aria-label="${escapeHTML(content.title)} sections">${content.sections
          .map((section, index) => `<button type="button" data-section-target="section-${index + 1}">${escapeHTML(section.title.replace(/^\d+\.\s*/, ""))}</button>`)
          .join("")}</nav>`
        : ""}<div class="info-sections">${content.sections
          .map(
            (section, index) => {
              const isGuide = section.layout === "guide";
              const routes = section.routes
                ? `<div class="route-groups">${section.routes
                  .map(
                    (route) => `<article class="route-group">
                        <h3>${escapeHTML(route.title)}</h3>
                        <ol class="route-steps">${route.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ol>
                        ${renderActions(route.actions)}
                      </article>`
                  )
                  .join("")}</div>`
                : "";
              const list = section.items
                ? isGuide
                  ? `<ol class="route-steps">${section.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ol>`
                  : `<ul>${section.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`
                : "";
              const sectionImages = section.images || (section.image ? [section.image] : []);
              const sectionImage = sectionImages.length
                ? `<div class="section-images">${sectionImages
                  .map(
                    (image) => `<figure class="section-image">
                        <a href="${escapeHTML(image.src)}" ${image.enlarge ? `target="_blank" rel="noopener noreferrer"` : ""}>
                          <img src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt || section.title)}" loading="lazy" />
                        </a>
                        ${image.caption ? `<figcaption>${escapeHTML(image.caption)}</figcaption>` : ""}
                      </figure>`
                  )
                  .join("")}</div>`
                : "";
              return `<section id="section-${index + 1}" class="${[isGuide ? "guide-section" : "", section.layout === "poster" ? "poster-section" : ""].filter(Boolean).join(" ")}">
              <h2>${escapeHTML(section.title)}</h2>
              ${section.text ? `<p>${escapeHTML(section.text)}</p>` : ""}
              ${routes}
              ${list}
              ${renderActions(section.actions)}
              ${sectionImage}
            </section>`;
            }
          )
          .join("")}</div>`
      : "";
    const featureSets = content.featureSets
      ? `<div class="feature-sets">${content.featureSets
        .map(
          (set) => `<section class="feature-set">
              <div class="section-heading">
                <h2>${escapeHTML(set.title)}</h2>
                ${set.summary ? `<p>${escapeHTML(set.summary)}</p>` : ""}
              </div>
              ${renderGroupGrid(set.groups)}
              ${set.sections
              ? `<div class="info-sections">${set.sections
                .map((section) => `<section class="${section.layout === "poster" ? "poster-section" : ""}">
                      <h2>${escapeHTML(section.title)}</h2>
                      ${section.text ? `<p>${escapeHTML(section.text)}</p>` : ""}
                      ${section.images && section.images.length
                    ? `<div class="section-images">${section.images
                      .map(
                        (image) => `<figure class="section-image">
                                  <a href="${escapeHTML(image.src)}" ${image.enlarge ? `target="_blank" rel="noopener noreferrer"` : ""}>
                                    <img src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt || section.title)}" loading="lazy" />
                                  </a>
                                  ${image.caption ? `<figcaption>${escapeHTML(image.caption)}</figcaption>` : ""}
                                </figure>`
                      )
                      .join("")}</div>`
                    : ""
                  }
                    </section>`)
                .join("")}</div>`
              : ""}
            </section>`
        )
        .join("")}</div>`
      : "";
    const gallery = content.images
      ? `<div class="gallery-grid">${content.images
        .map((src, index) => `<img src="${escapeHTML(src)}" alt="${escapeHTML(content.title)} ${index + 1}" loading="lazy" />`)
        .join("")}</div>`
      : "";
    const image = content.image
      ? `<figure class="wide-image"><img src="${escapeHTML(content.image)}" alt="${escapeHTML(content.title)}" /></figure>`
      : "";

    return `${body}${topics}${eventBlocks}${showcase}${featureSets}${groups}${announcements}${timeline}${schedule}${sections}${gallery}${image}${renderActions(content.actions)}`;
  }

  function renderInfoContent(content) {
    const carousel = content.imageCarousel
      ? `<section class="info-carousel" aria-label="${escapeHTML(content.title)} visual carousel">
          ${content.imageCarousel
        .map(
          (image, index) => `<figure class="info-slide" style="--slide-index: ${index}">
                <img src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt)}" />
              </figure>`
        )
        .join("")}
        </section>`
      : "";
    const blocks = content.infoBlocks || [];
    const nav = blocks.length
      ? `<nav class="info-jump-nav" aria-label="${escapeHTML(content.title)} sections">
          ${blocks.map((block) => `<a href="${linkTo("info")}/${escapeHTML(block.id)}">${escapeHTML(block.title)}</a>`).join("")}
        </nav>`
      : "";
    const blockContent = blocks.length
      ? `<div class="info-blocks">${blocks
        .map(
          (block) => `<section class="info-block" id="${escapeHTML(block.id)}">
              <div class="info-block-heading">
                <span>${escapeHTML(block.label)}</span>
                <div>
                  <h2>${escapeHTML(block.title)}</h2>
                  <p>${escapeHTML(block.summary)}</p>
                </div>
              </div>
              ${block.body ? `<div class="prose">${block.body.map((item) => `<p>${escapeHTML(item)}</p>`).join("")}</div>` : ""}
              ${block.items
              ? `<ul class="info-check-list">${block.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`
              : ""
            }
              ${block.subsections
              ? `<div class="info-subsections">${block.subsections
                .map(
                  (section) => `<article class="info-subsection">
                          <h3>${escapeHTML(section.title)}</h3>
                          ${section.body ? `<div class="prose">${section.body.map((item) => `<p>${escapeHTML(item)}</p>`).join("")}</div>` : ""}
                          ${section.items ? `<ul class="info-check-list">${section.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}
                          ${renderActions(section.actions)}
                        </article>`
                )
                .join("")}</div>`
              : ""
            }
              ${block.questions
              ? `<div class="faq-list">${block.questions
                .map((item) => `<article><h3>${escapeHTML(item.q)}</h3><p>${escapeHTML(item.a)}</p></article>`)
                .join("")}</div>`
              : ""
            }
            </section>`
        )
        .join("")}</div>`
      : renderCommonContent(content);

    return `${carousel}${nav}${blockContent}`;
  }

  function renderHome(content) {
    const heroTitle = content.heroTitle || content.title;
    const heroSubtitle = content.heroSubtitle ? `<p class="hero-subtitle">${escapeHTML(content.heroSubtitle)}</p>` : "";
    const highlights = content.highlights
      ? `<div class="highlights">${content.highlights
        .map((item) => `<article><span>${escapeHTML(item.label)}</span><strong>${escapeHTML(item.value)}</strong></article>`)
        .join("")}</div>`
      : "";
    const intro = content.body && content.body.length
      ? `<div class="prose home-intro">${content.body.map((item) => `<p>${escapeHTML(item)}</p>`).join("")}</div>`
      : "";
    const columns = content.columns && content.columns.length
      ? `<div class="home-columns">${content.columns
        .map((item) => {
          const column = typeof item === "string" ? { text: item } : item;
          const logos = column.logos && column.logos.length
            ? `<div class="home-card-marks">${column.logos
              .map((logo) => `<img src="${escapeHTML(logo.src)}" alt="${escapeHTML(logo.alt)}" loading="lazy" />`)
              .join("")}</div>`
            : "";
          const labelContent = column.url ? `<a href="${escapeHTML(column.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(column.label)}</a>` : escapeHTML(column.label);
          return `<article>${logos}${column.label ? `<strong class="home-card-title">${labelContent}</strong>` : ""}<p>${column.text}</p></article>`;
        })
        .join("")}</div>`
      : "";

    const columnsTitle = content.columnsTitle
      ? `<h2 class="home-columns-title">${escapeHTML(content.columnsTitle)}</h2>`
      : "";

    return `<section class="hero" style="--hero-image: url('${escapeHTML(data.site.heroImage)}')">
      <div class="hero-content">
        <p class="eyebrow">${escapeHTML(content.eyebrow)}</p>
        <h1>${escapeHTML(heroTitle)}</h1>
        ${heroSubtitle}
        <p class="hero-summary">${escapeHTML(content.summary)}</p>
        ${renderActions(content.actions)}
      </div>
    </section>
    <section class="content-band">
      <div class="content-inner">
        ${highlights}
        ${intro}
        ${columnsTitle}
        ${columns}
        ${renderCommonContent({ ...content, body: [], actions: [] })}
      </div>
    </section>`;
  }

  function renderPage() {
    setRoute();
    const content = t(page);
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.title = content.nav === "首頁" || content.nav === "Home"
      ? "2026重構跨越臺海的現代史 | 會議官網"
      : `${content.title} | 2026重構跨越臺海的現代史 | 會議官網`;

    document.querySelectorAll("[data-bind]").forEach((node) => {
      const path = node.dataset.bind.split(".");
      node.textContent = path.reduce((obj, key) => obj && obj[key], data) || "";
    });

    nav.innerHTML = `<div class="nav-scroll">${data.nav
      .map((pageId) => `<a class="${pageId === page ? "active" : ""}" href="${linkTo(pageId)}">${escapeHTML(t(pageId).nav)}</a>`)
      .join("")}</div>
      <div class="lang-switch">
        <a href="${linkTo(page, lang === "zh" ? "en" : "zh")}">${escapeHTML(lang === "zh" ? "ENGLISH" : "中文")}</a>
      </div>`;

    footerLinks.innerHTML = data.externalLinks
      .map((link) => `<a href="${escapeHTML(link.url)}">${escapeHTML(link.label)}</a>`)
      .join("");

    if (page === "home") {
      main.innerHTML = renderHome(content);
    } else {
      main.innerHTML = `<section class="page-hero">
        <div class="content-inner">
          <p class="eyebrow">${escapeHTML(data.site.shortTitle)}</p>
          <h1>${escapeHTML(content.title)}</h1>
          <p>${escapeHTML(content.summary || "")}</p>
        </div>
      </section>
      <section class="content-band">
        <div class="content-inner page-content">
          ${page === "info" ? renderInfoContent(content) : renderCommonContent(content)}
        </div>
      </section>`;
    }
    if (page === "info" && section) {
      requestAnimationFrame(() => {
        document.getElementById(section)?.scrollIntoView({ block: "start" });
      });
    }
    menuButton.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  }

  function setupEditor() {
    const editor = document.querySelector("#editor");
    if (!location.search.includes("edit=1")) return;
    editor.hidden = false;

    const titleInput = document.querySelector("#edit-title");
    const heroInput = document.querySelector("#edit-hero");
    const registrationInput = document.querySelector("#edit-registration-url");
    const homeTitleInput = document.querySelector("#edit-home-title");
    const homeBodyInput = document.querySelector("#edit-home-body");
    const infoBlocksEditor = document.querySelector("#edit-info-blocks");
    const output = document.querySelector("#export-output");

    function paragraphText(items) {
      return (items || []).join("\n\n");
    }

    function parseParagraphs(value) {
      return value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    }

    function renderInfoBlockFields() {
      const fields = ["zh", "en"].flatMap((language) =>
        (data.pages[language].info.infoBlocks || []).map(
          (block, index) => `<label>
            ${escapeHTML(data.languages[language])}｜${escapeHTML(block.title)}
            <textarea data-info-lang="${language}" data-info-index="${index}" rows="5">${escapeHTML(paragraphText(block.body))}</textarea>
          </label>`
        )
      );
      infoBlocksEditor.innerHTML = fields.join("");
    }

    function loadFields() {
      titleInput.value = data.site.title;
      heroInput.value = data.site.heroImage;
      registrationInput.value = data.site.registrationUrl || "";
      homeTitleInput.value = data.pages.zh.home.title;
      homeBodyInput.value = paragraphText(data.pages.zh.home.body);
      renderInfoBlockFields();
    }

    document.querySelector("#save-editor").addEventListener("click", () => {
      data.site.title = titleInput.value.trim();
      data.site.heroImage = heroInput.value.trim();
      data.site.registrationUrl = registrationInput.value.trim();
      data.pages.zh.home.title = homeTitleInput.value.trim();
      data.pages.zh.home.body = parseParagraphs(homeBodyInput.value);
      infoBlocksEditor.querySelectorAll("[data-info-lang]").forEach((field) => {
        const block = data.pages[field.dataset.infoLang].info.infoBlocks[Number(field.dataset.infoIndex)];
        block.body = parseParagraphs(field.value);
      });
      localStorage.setItem("conferenceSiteData", JSON.stringify(data));
      renderPage();
    });

    document.querySelector("#export-editor").addEventListener("click", () => {
      output.value = `window.CONFERENCE_SITE_DATA = ${JSON.stringify(data, null, 2)};\n`;
      output.select();
    });

    document.querySelector("#close-editor").addEventListener("click", () => {
      editor.hidden = true;
    });

    loadFields();
  }

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest("[data-section-target]");
    if (!target) return;
    document.getElementById(target.dataset.sectionTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("hashchange", renderPage);
  if (!location.hash) location.hash = "#/zh/home";
  setupEditor();
  renderPage();
})();
