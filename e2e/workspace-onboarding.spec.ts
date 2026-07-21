import { expect, test } from "@playwright/test";

import { installWorkspaceServiceMock } from "./workspace-service-mock";

test("creates a local workspace and enters the desktop shell", async ({ page }) => {
  await installWorkspaceServiceMock(page, "first-run");
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Tus datos, siempre contigo" })).toBeVisible();
  await expect(page.getByText("Nada se sube a internet")).toBeVisible();

  await page.getByRole("button", { name: "Crear espacio de trabajo" }).click();
  const nameField = page.getByRole("textbox", { name: "Nombre del espacio" });
  await nameField.fill("CON");
  await nameField.blur();
  await expect(page.getByText("Ese nombre está reservado por Windows. Elige otro.")).toBeVisible();

  await nameField.fill("Mi Neo");
  await page.getByRole("button", { name: "Crear espacio", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "¿Crear este espacio de trabajo?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Crear espacio" }).click();

  const success = page.getByText("Espacio de trabajo creado correctamente.");
  await expect(success).toBeFocused();
  await expect(page.getByRole("heading", { name: "Buenos días" })).toBeVisible();
  await expect(page.getByText("Mi Neo", { exact: true })).toHaveCount(2);

  await page.getByRole("link", { name: "Salud" }).click();
  await expect(page.getByRole("heading", { name: "Salud", level: 1 })).toBeVisible();
});

test("opens an existing workspace and shows its settings summary", async ({ page }) => {
  await installWorkspaceServiceMock(page, "first-run");
  await page.goto("/");

  await page.getByRole("button", { name: "Abrir espacio existente" }).click();
  await expect(page.getByRole("heading", { name: "Buenos días" })).toBeVisible();
  await expect(page.getByText("Familia", { exact: true })).toHaveCount(2);

  await page.getByRole("link", { name: "Ajustes" }).click();
  await expect(page.getByRole("heading", { name: "Espacio de trabajo" })).toBeVisible();
  await expect(page.getByText("…\\Familia\\Neo")).toBeVisible();
});

test("keeps an invalid existing workspace error recoverable", async ({ page }) => {
  await installWorkspaceServiceMock(page, "invalid-open");
  await page.goto("/");

  await page.getByRole("button", { name: "Abrir espacio existente" }).click();
  const error = page.getByRole("alert");
  await expect(
    error.getByRole("heading", { name: "Esta carpeta no es un espacio de Neo" }),
  ).toBeVisible();
  await expect(error.locator("..")).toBeFocused();
  await expect(page.getByRole("button", { name: "Crear espacio de trabajo" })).toBeEnabled();
});
