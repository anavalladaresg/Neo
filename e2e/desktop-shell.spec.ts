import { expect, test } from "@playwright/test";

const navigationDestinations = [
  "Inicio",
  "Alimentación",
  "Salud",
  "Entrenamiento",
  "Galería",
  "Evolución",
  "Recordatorios",
  "Notas",
  "Ajustes",
] as const;

test("loads the Neo desktop shell and navigates across every product area", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Buenos días" })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Navegación principal" });
  await expect(navigation).toBeVisible();

  for (const label of navigationDestinations) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }

  await navigation.getByRole("link", { name: "Salud" }).click();
  await expect(page.getByRole("heading", { name: "Salud", level: 1 })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Salud" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("supports arrow-key navigation in the permanent sidebar", async ({ page }) => {
  await page.goto("/");

  const homeLink = page.getByRole("link", { name: "Inicio" });
  const feedingLink = page.getByRole("link", { name: "Alimentación" });
  await homeLink.focus();
  await page.keyboard.press("ArrowDown");
  await expect(feedingLink).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("link", { name: "Ajustes" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(homeLink).toBeFocused();
});

for (const viewport of [
  { width: 1180, height: 780, name: "recommended" },
  { width: 760, height: 600, name: "minimum" },
] as const) {
  test(`avoids horizontal overflow at the ${viewport.name} desktop window size`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const overflow = await page.evaluate(() => ({
      body: document.body.scrollWidth - document.body.clientWidth,
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));

    expect(overflow.body).toBeLessThanOrEqual(0);
    expect(overflow.document).toBeLessThanOrEqual(0);
    await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajustes" })).toBeVisible();
  });
}

test("closes the confirmation dialog with Escape and restores focus", async ({ page }) => {
  await page.goto("/#/componentes");

  const trigger = page.getByRole("button", { name: "Abrir confirmación" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "¿Quieres quitar este ejemplo?" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Quitar ejemplo" })).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
