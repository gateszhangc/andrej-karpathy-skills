const { test, expect } = require("@playwright/test");

test("homepage exposes the tribute skill map", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Andrej Karpathy Skills/);
  await expect(page.getByRole("heading", { name: "Andrej Karpathy Skills" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore skill map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Six visible signals." })).toBeVisible();
  await expect(page.getByText("Unofficial tribute page.")).toBeVisible();
});

test("brand assets are served", async ({ page }) => {
  await page.goto("/");

  for (const path of [
    "/favicon.ico",
    "/assets/brand/logo.png",
    "/assets/brand/logo-mark.png",
    "/assets/brand/favicon-32x32.png",
    "/assets/brand/og-image.png"
  ]) {
    const response = await page.request.get(path);
    expect(response.ok(), `${path} should return 200`).toBeTruthy();
    expect(Number(response.headers()["content-length"] || 1), `${path} should not be empty`).toBeGreaterThan(0);
  }
});

test("seo surfaces canonical, sitemap, robots and absolute social metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://andrej-karpathy-skills.lol/");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://andrej-karpathy-skills.lol/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://andrej-karpathy-skills.lol/assets/brand/og-image.png"
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    "https://andrej-karpathy-skills.lol/assets/brand/og-image.png"
  );
  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  expect(structuredData || "").toContain("Andrej Karpathy");

  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  await expect.soft(robots.text()).resolves.toContain("Sitemap: https://andrej-karpathy-skills.lol/sitemap.xml");

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  await expect.soft(sitemap.text()).resolves.toContain("<loc>https://andrej-karpathy-skills.lol/</loc>");
});

test("primary sections fit mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heroTitle = page.getByRole("heading", { name: "Andrej Karpathy Skills" });
  const box = await heroTitle.boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
  await expect(page.getByRole("link", { name: "Trace learning trail" })).toBeVisible();
});

test("hero neural canvas renders colored signal pixels", async ({ page }) => {
  await page.goto("/");
  const coloredPixels = await page.locator("#neural-field").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const { width, height } = canvas;
    const sample = context.getImageData(0, 0, width, height).data;
    let count = 0;
    for (let index = 0; index < sample.length; index += 16) {
      const red = sample[index];
      const green = sample[index + 1];
      const blue = sample[index + 2];
      if (Math.max(red, green, blue) - Math.min(red, green, blue) > 24) {
        count += 1;
      }
    }
    return count;
  });

  expect(coloredPixels).toBeGreaterThan(100);
});
