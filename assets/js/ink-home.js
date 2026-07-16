(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const storedTheme = localStorage.getItem("academic-theme");
  let redrawField = () => {};

  if (storedTheme === "light" || storedTheme === "dark") {
    root.dataset.theme = storedTheme;
  }

  const arrowIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  const figureIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 17 4-4 3 3 2-2 5 3"/></svg>';

  function currentTheme() {
    return root.dataset.theme || (darkScheme.matches ? "dark" : "light");
  }

  function setupTopbar() {
    const masthead = document.querySelector(".masthead");
    if (!masthead) return;

    masthead.innerHTML = `
      <div class="topbar-inner">
        <a class="brand" href="#top">Zhenxin Huang</a>
        <nav class="topnav" aria-label="Homepage sections">
          <a href="#about">About</a>
          <a href="#news">News</a>
          <a href="#pubs">Publications</a>
          <a href="#honors">Honors</a>
          <a href="#edu">Education</a>
          <a href="#projects">Projects</a>
        </nav>
        <button class="theme-toggle" type="button" aria-label="Toggle color theme">Theme</button>
      </div>`;

    const button = masthead.querySelector(".theme-toggle");
    const syncButton = () => {
      const theme = currentTheme();
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.title = `Current theme: ${theme}`;
    };

    button.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem("academic-theme", next);
      syncButton();
      redrawField();
    });

    syncButton();
  }

  function cleanHeading(text) {
    return text.replace(/[🔥📝🎖📖💬💻]/g, "").trim();
  }

  function datedList(nodes, listClass, dateClass, textClass) {
    const source = nodes.find((node) => node.nodeType === Node.ELEMENT_NODE && node.tagName === "UL");
    const list = document.createElement("ul");
    list.className = listClass;
    if (!source) return list;

    source.querySelectorAll(":scope > li").forEach((item) => {
      const emphasis = item.querySelector("em");
      const date = emphasis ? emphasis.textContent.trim() : "";
      const text = item.textContent.replace(date, "").replace(/^\s*:\s*/, "").trim();
      const dateNode = document.createElement("span");
      const textNode = document.createElement("span");
      dateNode.className = dateClass;
      textNode.className = textClass;
      dateNode.textContent = date;
      textNode.textContent = text;
      item.replaceChildren(dateNode, textNode);
      list.appendChild(item);
    });

    return list;
  }

  function buildAbout(nodes) {
    const about = document.createElement("div");
    about.className = "about";
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("anchor")) return;
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      about.appendChild(node);
    });

    const highlightedTerms = new Set([
      "scientific machine learning",
      "neural operators",
      "PDE data generation",
      "parameter-efficient adaptation"
    ]);
    about.querySelectorAll("strong").forEach((strong) => {
      if (highlightedTerms.has(strong.textContent.trim())) strong.classList.add("hl");
    });
    return about;
  }

  function buildPublications(nodes) {
    const source = nodes.find((node) => node.nodeType === Node.ELEMENT_NODE && node.tagName === "UL");
    const publications = document.createElement("div");
    publications.className = "pubs";
    if (!source) return publications;

    source.querySelectorAll(":scope > li").forEach((item, index) => {
      const strong = item.querySelector("strong");
      const title = strong ? strong.textContent.trim() : item.textContent.trim();
      const detail = item.textContent.replace(title, "").replace(/^\s*\.\s*/, "").replace(/\.\s*$/, "").trim();
      const venueMatch = detail.match(/\b(?:AAAI|NeurIPS)\s+\d{4}\b/i);
      const venue = venueMatch ? `${venueMatch[0]} · In preparation` : detail;

      const publication = document.createElement("article");
      publication.className = "pub";

      const number = document.createElement("div");
      number.className = "idx";
      number.textContent = String(index + 1);

      const body = document.createElement("div");
      body.className = "pub-body";
      const venueNode = document.createElement("div");
      venueNode.className = "venue";
      venueNode.textContent = venue;
      const titleNode = document.createElement("h3");
      titleNode.textContent = title;
      const authors = document.createElement("p");
      authors.className = "authors";
      const owner = document.createElement("strong");
      owner.textContent = "Zhenxin Huang";
      authors.append(owner, ", et al.");
      body.append(venueNode, titleNode, authors);

      const figure = document.createElement("div");
      figure.className = "figure";
      figure.setAttribute("aria-label", "Publication figure placeholder");
      figure.innerHTML = figureIcon;

      publication.append(number, body, figure);
      publications.appendChild(publication);
    });

    return publications;
  }

  function buildEducation(nodes) {
    const source = nodes.find((node) => node.nodeType === Node.ELEMENT_NODE && node.tagName === "UL");
    const entries = document.createElement("div");
    entries.className = "entries";
    if (!source) return entries;

    source.querySelectorAll(":scope > li").forEach((item) => {
      const emphasis = item.querySelector("em");
      const when = emphasis ? emphasis.textContent.trim() : "";
      const text = item.textContent.replace(when, "").replace(/^\s*:\s*/, "").trim();
      const sentenceBreak = text.match(/\.\s+(?=[A-Z])/);
      const splitAt = sentenceBreak ? sentenceBreak.index : -1;
      const title = splitAt === -1 ? text.replace(/\.\s*$/, "") : text.slice(0, splitAt);
      const detail = splitAt === -1 ? "" : text.slice(splitAt + sentenceBreak[0].length).trim();

      const entry = document.createElement("div");
      entry.className = "entry";
      const titleNode = document.createElement("h3");
      titleNode.textContent = title;
      const whenNode = document.createElement("span");
      whenNode.className = "when";
      whenNode.textContent = when;
      entry.append(titleNode, whenNode);
      if (detail) {
        const detailNode = document.createElement("p");
        detailNode.textContent = detail;
        entry.appendChild(detailNode);
      }
      entries.appendChild(entry);
    });

    return entries;
  }

  function buildProjects(nodes) {
    const source = nodes.find((node) => node.nodeType === Node.ELEMENT_NODE && node.tagName === "UL");
    const projects = document.createElement("div");
    projects.className = "projects";
    if (!source) return projects;

    // ponytail: project URLs are absent; use the profile until structured project data supplies per-item links.
    const profileUrl = "https://github.com/hzx-coder0";
    source.querySelectorAll(":scope > li").forEach((item) => {
      const strong = item.querySelector("strong");
      const title = strong ? strong.textContent.trim() : item.textContent.trim();
      const description = item.textContent.replace(title, "").replace(/^\s*:\s*/, "").trim();
      const project = document.createElement("a");
      project.className = "proj";
      project.href = profileUrl;
      project.target = "_blank";
      project.rel = "noopener";

      const titleNode = document.createElement("h3");
      titleNode.textContent = title;
      const descriptionNode = document.createElement("p");
      descriptionNode.textContent = description;
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.innerHTML = arrowIcon;
      project.append(titleNode, descriptionNode, arrow);
      projects.appendChild(project);
    });

    return projects;
  }

  function buildSection(title, nodes) {
    const definitions = {
      "about me": { id: "about", label: "About Me", build: buildAbout },
      "news": { id: "news", label: "News", build: (items) => datedList(items, "news", "d", "t") },
      "publications": { id: "pubs", label: "Publications", build: buildPublications },
      "honors and awards": { id: "honors", label: "Honors and Awards", build: (items) => datedList(items, "honors", "y", "w") },
      "educations": { id: "edu", label: "Education", build: buildEducation },
      "projects": { id: "projects", label: "Projects", build: buildProjects }
    };
    const definition = definitions[title.toLowerCase()];
    if (!definition) return null;

    const section = document.createElement("section");
    section.id = definition.id;
    section.className = "sec";
    const heading = document.createElement("h2");
    heading.textContent = definition.label;
    section.append(heading, definition.build(nodes));
    return section;
  }

  function transformContent() {
    const content = document.querySelector(".page__content");
    if (!content) return;

    const groups = [{ title: "About Me", nodes: [] }];
    Array.from(content.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "H1") {
        groups.push({ title: cleanHeading(node.textContent), nodes: [] });
      } else {
        groups[groups.length - 1].nodes.push(node);
      }
    });

    const sections = groups.map((group) => buildSection(group.title, group.nodes)).filter(Boolean);
    content.replaceChildren(...sections);
  }

  function setupFlowField() {
    const canvas = document.getElementById("field");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrame = 0;

    const ink = () => getComputedStyle(root).getPropertyValue("--ink").trim() || "#131311";
    const field = (x, y, time) => Math.sin(x * 0.006 + time) + Math.cos(y * 0.007 - time * 0.8) + Math.sin((x + y) * 0.004 + time * 0.5);

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = bounds.width;
      height = bounds.height;
    }

    function seed() {
      const count = Math.min(80, Math.round(width / 12));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 30 + Math.random() * 40
      }));
    }

    function draw(time, alpha) {
      context.clearRect(0, 0, width, height);
      context.strokeStyle = ink();
      context.globalAlpha = alpha;
      context.lineWidth = 1;
      particles.forEach((particle) => {
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        let x = particle.x;
        let y = particle.y;
        for (let step = 0; step < particle.length; step += 1) {
          const angle = field(x, y, time) * Math.PI;
          x += Math.cos(angle) * 2;
          y += Math.sin(angle) * 2;
          context.lineTo(x, y);
        }
        context.stroke();
      });
    }

    function frame(timestamp) {
      const time = timestamp * 0.00016;
      draw(time, 0.15);
      particles.forEach((particle) => {
        const angle = field(particle.x, particle.y, time) * Math.PI;
        particle.x += Math.cos(angle) * 0.4;
        particle.y += Math.sin(angle) * 0.4;
        if (particle.x < -20 || particle.x > width + 20 || particle.y < -20 || particle.y > height + 20) {
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
        }
      });
      animationFrame = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(animationFrame);
      resize();
      seed();
      if (reducedMotion.matches) draw(0.3, 0.13);
      else animationFrame = requestAnimationFrame(frame);
    }

    redrawField = () => {
      if (reducedMotion.matches) draw(0.3, 0.13);
    };
    window.addEventListener("resize", start);
    start();
  }

  function addFooter() {
    const main = document.getElementById("main");
    if (!main) return;
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.textContent = `© ${new Date().getFullYear()} Zhenxin Huang · Built with Jekyll on GitHub Pages`;
    main.insertAdjacentElement("afterend", footer);
  }

  transformContent();
  setupTopbar();
  setupFlowField();
  addFooter();
})();
