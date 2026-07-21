import { expect, test } from "@playwright/test";

test("loads the generated desktop scaffold in a browser", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Welcome to Tauri + React" })).toBeVisible();
  await expect(page.getByPlaceholder("Enter a name...")).toBeEditable();
  await expect(page.getByRole("button", { name: "Greet" })).toBeEnabled();
});
