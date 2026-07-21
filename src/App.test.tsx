import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "./App";
import { productRoutes } from "./app/routes";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { PageHeader } from "./components/ui/PageHeader";

describe("Neo desktop shell", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("renders the desktop shell and every navigation destination", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Buenos días" })).toBeVisible();
    const navigation = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(navigation).toBeVisible();
    expect(within(navigation).getAllByRole("link")).toHaveLength(productRoutes.length);
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  });

  it("navigates to every Spanish product page", async () => {
    const user = userEvent.setup();
    render(<App />);

    for (const route of productRoutes.slice(1)) {
      await user.click(screen.getByRole("link", { name: route.title }));

      expect(screen.getByRole("heading", { name: route.title, level: 1 })).toBeVisible();
      expect(screen.getByRole("link", { name: route.title })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  it("moves focus through primary navigation with desktop arrow keys", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "Navegación principal" });
    const homeLink = screen.getByRole("link", { name: "Inicio" });
    const feedingLink = screen.getByRole("link", { name: "Alimentación" });
    const healthLink = screen.getByRole("link", { name: "Salud" });
    const settingsLink = screen.getByRole("link", { name: "Ajustes" });

    fireEvent.keyDown(navigation, { key: "ArrowDown" });
    homeLink.focus();
    await user.keyboard("{ArrowDown}");
    expect(feedingLink).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(healthLink).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(feedingLink).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(homeLink).toHaveFocus();
    await user.keyboard("{End}");
    expect(settingsLink).toHaveFocus();
    await user.keyboard("{Home}");
    expect(homeLink).toHaveFocus();
    await user.keyboard("x");
    expect(homeLink).toHaveFocus();
  });

  it("renders optional shared primitive content without changing semantics", () => {
    render(
      <>
        <PageHeader description="Descripción de prueba" title="Cabecera sencilla" />
        <Card action={<Button className="custom-action">Acción</Button>} title="Tarjeta de prueba">
          Contenido
        </Card>
      </>,
    );

    expect(screen.getByRole("heading", { name: "Cabecera sencilla", level: 1 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Tarjeta de prueba", level: 2 })).toBeVisible();
    expect(screen.getByRole("button", { name: "Acción" })).toHaveClass("custom-action");
  });
});
