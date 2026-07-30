import "./styles.css";
import {
  pipeline,
  products,
  type PipelineStage,
  type Product,
  type ProductId,
} from "./data";

type Theme = "light" | "dark";

interface ReleaseState {
  tag: string;
  publishedAt: string;
  url: string;
  source: "fallback" | "api";
}

interface GitHubRelease {
  tag_name?: unknown;
  published_at?: unknown;
  html_url?: unknown;
}

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return element;
}

const productPanel = requiredElement<HTMLElement>("#product-panel");
const productLauncher = requiredElement<HTMLElement>("#product-launcher");
const productImage = requiredElement<HTMLImageElement>("#product-image");
const productLabel = requiredElement<HTMLElement>("#product-label");
const productName = requiredElement<HTMLElement>("#product-name");
const productDescription = requiredElement<HTMLElement>("#product-description");
const productStatus = requiredElement<HTMLElement>("#product-status");
const productFeatures = requiredElement<HTMLUListElement>("#product-features");
const productRepository = requiredElement<HTMLAnchorElement>("#product-repository");
const productRelease = requiredElement<HTMLAnchorElement>("#product-release");
const releaseTag = requiredElement<HTMLElement>("#release-tag");
const releaseDate = requiredElement<HTMLElement>("#release-date");
const releaseSource = requiredElement<HTMLElement>("#release-source");
const screenLabel = requiredElement<HTMLElement>("#screen-label");
const screenIndex = requiredElement<HTMLElement>("#screen-index");

const pipelineSteps = requiredElement<HTMLElement>("#pipeline-steps");
const pipelineIndex = requiredElement<HTMLElement>("#pipeline-index");
const pipelineShort = requiredElement<HTMLElement>("#pipeline-short");
const pipelineTitle = requiredElement<HTMLElement>("#pipeline-title");
const pipelineDescription = requiredElement<HTMLElement>("#pipeline-description");

const commandPalette = requiredElement<HTMLDialogElement>("#command-palette");
const commandList = requiredElement<HTMLElement>("#command-list");
const commandSearch = requiredElement<HTMLInputElement>("#command-search");
const commandOpen = requiredElement<HTMLButtonElement>("#command-open");
const heroCommand = requiredElement<HTMLButtonElement>("#hero-command");
const commandClose = requiredElement<HTMLButtonElement>("#command-close");
const themeToggle = requiredElement<HTMLButtonElement>("#theme-toggle");
const currentYear = requiredElement<HTMLElement>("#current-year");

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const releaseState = new Map<ProductId, ReleaseState>(
  products.map((product) => [
    product.id,
    {
      ...product.release,
      source: "fallback" as const,
    },
  ]),
);

const initialProduct = products[0];
const initialPipelineStage = pipeline[0];

if (!initialProduct || !initialPipelineStage) {
  throw new Error("Product showcase data is empty");
}

let activeProductId: ProductId = initialProduct.id;
let activePipelineId = initialPipelineStage.id;
let productTransitionTimer = 0;
let pointerFrame = 0;

function assetUrl(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}

function formatDate(value: string): string {
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function productById(id: ProductId): Product {
  const product = products.find((candidate) => candidate.id === id);
  if (!product) {
    throw new Error(`Unknown product: ${id}`);
  }
  return product;
}

function updateReleaseView(product: Product): void {
  const release = releaseState.get(product.id);
  if (!release) {
    return;
  }

  releaseTag.textContent = release.tag;
  releaseDate.textContent = formatDate(release.publishedAt);
  releaseSource.textContent =
    release.source === "api" ? "Открытый GitHub API" : "Статический fallback";
  productRelease.href = release.url;
  productRelease.setAttribute(
    "aria-label",
    `Открыть публичный релиз ${release.tag} продукта ${product.name}`,
  );
}

function renderProduct(product: Product): void {
  activeProductId = product.id;
  productImage.src = assetUrl(product.image);
  productImage.alt = product.imageAlt;
  productLabel.textContent = `${product.index} / ${product.label}`;
  productName.textContent = product.name;
  productDescription.textContent = product.description;
  productStatus.textContent = product.status;
  productRepository.href = product.repository;
  productRepository.setAttribute(
    "aria-label",
    `Открыть публичный репозиторий ${product.name}`,
  );
  screenLabel.textContent = `${product.name} / PUBLIC BUILD`;
  screenIndex.textContent = product.index;

  const featureItems = product.features.map((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    return item;
  });
  productFeatures.replaceChildren(...featureItems);

  updateReleaseView(product);

  productLauncher
    .querySelectorAll<HTMLButtonElement>("[data-product-id]")
    .forEach((button) => {
      const isActive = button.dataset.productId === product.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
}

function selectProduct(id: ProductId, moveFocus = false, immediate = false): void {
  const product = productById(id);
  window.clearTimeout(productTransitionTimer);

  const applySelection = (): void => {
    renderProduct(product);
    productPanel.classList.remove("is-switching");
    if (moveFocus) {
      productLauncher
        .querySelector<HTMLButtonElement>(`[data-product-id="${id}"]`)
        ?.focus();
    }
  };

  if (immediate || motionPreference.matches) {
    applySelection();
    return;
  }

  productPanel.classList.add("is-switching");
  productTransitionTimer = window.setTimeout(applySelection, 130);
}

function buildProductLauncher(): void {
  const buttons = products.map((product) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "launcher-item";
    button.dataset.productId = product.id;
    button.role = "tab";
    button.setAttribute("aria-controls", "product-panel");
    button.innerHTML = `
      <span class="launcher-item__index">${product.index}</span>
      <span>
        <strong>${product.name}</strong>
        <small>${product.label}</small>
      </span>
      <i aria-hidden="true">↗</i>
    `;
    button.addEventListener("click", () => selectProduct(product.id));
    return button;
  });

  productLauncher.replaceChildren(...buttons);
}

function moveWithinTabs(
  event: KeyboardEvent,
  container: HTMLElement,
  selector: string,
): void {
  if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
    return;
  }

  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>(selector),
  );
  const currentIndex = buttons.findIndex((button) => button === document.activeElement);
  if (currentIndex < 0) {
    return;
  }

  event.preventDefault();
  let nextIndex = currentIndex;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = buttons.length - 1;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
  if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
  }
  buttons[nextIndex]?.click();
  buttons[nextIndex]?.focus();
}

function renderPipeline(stage: PipelineStage): void {
  activePipelineId = stage.id;
  pipelineIndex.textContent = stage.index;
  pipelineShort.textContent = stage.short;
  pipelineTitle.textContent = stage.title;
  pipelineDescription.textContent = stage.description;

  pipelineSteps
    .querySelectorAll<HTMLButtonElement>("[data-stage-id]")
    .forEach((button) => {
      const isActive = button.dataset.stageId === stage.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
}

function buildPipeline(): void {
  const buttons = pipeline.map((stage, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pipeline-step";
    button.dataset.stageId = stage.id;
    button.role = "tab";
    button.innerHTML = `
      <span>${stage.index}</span>
      <strong>${stage.title}</strong>
      ${index < pipeline.length - 1 ? '<i aria-hidden="true">→</i>' : ""}
    `;
    button.addEventListener("click", () => renderPipeline(stage));
    return button;
  });

  pipelineSteps.replaceChildren(...buttons);
}

function setTheme(theme: Theme, persist: boolean): void {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему",
  );
  themeToggle.title =
    theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему";
  if (persist) {
    try {
      localStorage.setItem("mnenrasoft-theme", theme);
    } catch {
      // The visual state remains usable even when storage is unavailable.
    }
  }
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function buildCommandPalette(): void {
  const productCommands = products.map((product) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command-item";
    button.dataset.command = "product";
    button.dataset.productId = product.id;
    button.innerHTML = `
      <span class="command-item__key">${product.index}</span>
      <span>
        <strong>Открыть ${product.name}</strong>
        <small>${product.label}</small>
      </span>
      <i aria-hidden="true">↵</i>
    `;
    return button;
  });

  const processCommand = document.createElement("button");
  processCommand.type = "button";
  processCommand.className = "command-item";
  processCommand.dataset.command = "process";
  processCommand.innerHTML = `
    <span class="command-item__key">→</span>
    <span>
      <strong>Перейти к процессу разработки</strong>
      <small>Задача → Релиз</small>
    </span>
    <i aria-hidden="true">↵</i>
  `;

  const profileCommand = document.createElement("button");
  profileCommand.type = "button";
  profileCommand.className = "command-item";
  profileCommand.dataset.command = "profile";
  profileCommand.innerHTML = `
    <span class="command-item__key">@</span>
    <span>
      <strong>Открыть GitHub-профиль</strong>
      <small>@mnenracom</small>
    </span>
    <i aria-hidden="true">↗</i>
  `;

  commandList.replaceChildren(...productCommands, processCommand, profileCommand);
}

function visibleCommandButtons(): HTMLButtonElement[] {
  return Array.from(
    commandList.querySelectorAll<HTMLButtonElement>(".command-item:not([hidden])"),
  );
}

function openPalette(): void {
  commandSearch.value = "";
  commandList
    .querySelectorAll<HTMLButtonElement>(".command-item")
    .forEach((button) => {
      button.hidden = false;
    });
  if (!commandPalette.open) {
    commandPalette.showModal();
  }
  window.setTimeout(() => commandSearch.focus(), 0);
}

function closePalette(): void {
  if (commandPalette.open) {
    commandPalette.close();
  }
}

function handleCommand(button: HTMLButtonElement): void {
  const command = button.dataset.command;
  closePalette();

  if (command === "product") {
    const id = button.dataset.productId as ProductId | undefined;
    if (!id) return;
    selectProduct(id, true);
    requiredElement<HTMLElement>("#products").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (command === "process") {
    requiredElement<HTMLElement>("#process").scrollIntoView({ behavior: "smooth" });
    pipelineSteps
      .querySelector<HTMLButtonElement>(`[data-stage-id="${activePipelineId}"]`)
      ?.focus({ preventScroll: true });
    return;
  }

  if (command === "profile") {
    window.open("https://github.com/mnenracom", "_blank", "noopener,noreferrer");
  }
}

async function hydrateRelease(product: Product): Promise<void> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/mnenracom/${product.repositoryName}/releases?per_page=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!response.ok) return;

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return;
    const release = payload[0] as GitHubRelease | undefined;
    if (
      !release ||
      typeof release.tag_name !== "string" ||
      typeof release.published_at !== "string" ||
      typeof release.html_url !== "string"
    ) {
      return;
    }

    releaseState.set(product.id, {
      tag: release.tag_name,
      publishedAt: release.published_at,
      url: release.html_url,
      source: "api",
    });

    if (activeProductId === product.id) {
      updateReleaseView(product);
    }
  } catch {
    // The static release data remains visible when the public API is unavailable.
  }
}

function hydrateReleases(): void {
  void Promise.all(products.map((product) => hydrateRelease(product)));
}

buildProductLauncher();
buildPipeline();
buildCommandPalette();
selectProduct(activeProductId, false, true);
renderPipeline(initialPipelineStage);
setTheme(currentTheme(), false);
currentYear.textContent = String(new Date().getFullYear());

productLauncher.addEventListener("keydown", (event) => {
  moveWithinTabs(event, productLauncher, "[data-product-id]");
});

pipelineSteps.addEventListener("keydown", (event) => {
  moveWithinTabs(event, pipelineSteps, "[data-stage-id]");
});

themeToggle.addEventListener("click", () => {
  setTheme(currentTheme() === "dark" ? "light" : "dark", true);
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  try {
    if (localStorage.getItem("mnenrasoft-theme")) return;
  } catch {
    // Use the system theme when storage cannot be read.
  }
  setTheme(event.matches ? "dark" : "light", false);
});

commandOpen.addEventListener("click", openPalette);
heroCommand.addEventListener("click", openPalette);
commandClose.addEventListener("click", closePalette);

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openPalette();
  }
});

commandSearch.addEventListener("input", () => {
  const query = commandSearch.value.trim().toLocaleLowerCase("ru");
  commandList
    .querySelectorAll<HTMLButtonElement>(".command-item")
    .forEach((button) => {
      button.hidden = !button.textContent?.toLocaleLowerCase("ru").includes(query);
    });
});

commandPalette.addEventListener("click", (event) => {
  if (event.target === commandPalette) {
    closePalette();
    return;
  }

  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    ".command-item",
  );
  if (target) {
    handleCommand(target);
  }
});

commandPalette.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closePalette();
    return;
  }
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;

  const buttons = visibleCommandButtons();
  if (buttons.length === 0) return;
  event.preventDefault();
  const currentIndex = buttons.findIndex((button) => button === document.activeElement);
  const direction = event.key === "ArrowDown" ? 1 : -1;
  const nextIndex =
    currentIndex < 0
      ? direction > 0
        ? 0
        : buttons.length - 1
      : (currentIndex + direction + buttons.length) % buttons.length;
  buttons[nextIndex]?.focus();
});

productPanel.addEventListener("pointermove", (event) => {
  if (motionPreference.matches) return;
  window.cancelAnimationFrame(pointerFrame);
  pointerFrame = window.requestAnimationFrame(() => {
    const bounds = productPanel.getBoundingClientRect();
    productPanel.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    productPanel.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  });
});

productPanel.addEventListener("pointerleave", () => {
  productPanel.style.removeProperty("--pointer-x");
  productPanel.style.removeProperty("--pointer-y");
});

window.setTimeout(hydrateReleases, 300);
