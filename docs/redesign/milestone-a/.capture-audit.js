async page => {
  const root = "docs/redesign/milestone-a/screenshots";
  const results = {};

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [path, name] of [["/courses", "courses-1440x900.png"], ["/lab", "lab-1440x900.png"]]) {
    await page.goto("http://127.0.0.1:3000" + path, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${root}/${name}`, fullPage: true });
    results[path] = {
      text: (await page.locator("main").innerText()).slice(0, 800),
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    };
  }

  await page.goto("http://127.0.0.1:3000/jobs", { waitUntil: "networkidle", timeout: 120000 });
  await page.getByRole("button", { name: "Try sample job description" }).click();
  await page.getByRole("button", { name: "Analyze requirements" }).click();
  await page.getByRole("heading", { name: "Requirements and your next steps" }).waitFor();
  await page.screenshot({ path: `${root}/jobs-analyzed-1440x900.png`, fullPage: true });
  results.jobs = { result: (await page.locator("main").innerText()).includes("recognized skills") };

  await page.goto("http://127.0.0.1:3000/tutor", { waitUntil: "networkidle", timeout: 120000 });
  await page.getByLabel("Your question").fill("Explain JavaScript promises and suggest what I should practice next.");
  await page.getByRole("button", { name: "Show curated guidance" }).click();
  await page.getByRole("heading", { name: "Your study guidance" }).waitFor();
  await page.screenshot({ path: `${root}/tutor-curated-1440x900.png`, fullPage: true });
  results.tutor = { curated: (await page.locator("main").innerText()).includes("Curated learning pathway") };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3000/onboarding", { waitUntil: "networkidle", timeout: 120000 });
  await page.getByLabel("What should we call you?").fill("Audit student");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.screenshot({ path: `${root}/onboarding-step-2-390x844.png`, fullPage: true });
  results.onboarding = { stepTwo: (await page.locator("main").innerText()).includes("STEP 2 OF 2") };

  await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "networkidle", timeout: 120000 });
  await page.getByRole("button", { name: "Open all navigation" }).click();
  await page.screenshot({ path: `${root}/navigation-drawer-390x844.png`, fullPage: false });
  await page.keyboard.press("Escape");
  results.drawer = {
    closed: await page.locator("#studio-navigation-drawer").count() === 0,
    focusReturned: await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Open all navigation")
  };
  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  results.keyboard = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    text: document.activeElement?.textContent?.trim(),
    href: document.activeElement?.getAttribute("href")
  }));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle", timeout: 120000 });
  results.reducedMotion = await page.evaluate(() => {
    const node = document.querySelector(".lc-hero-copy");
    if (!node) return null;
    const style = getComputedStyle(node);
    return { animationName: style.animationName, animationDuration: style.animationDuration };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  return results;
}
