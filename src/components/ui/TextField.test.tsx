import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates its label and hint with the input", () => {
    render(<TextField hint="Puedes cambiarlo más adelante." label="Nombre del perro" />);

    const input = screen.getByRole("textbox", { name: "Nombre del perro" });
    const hint = screen.getByText("Puedes cambiarlo más adelante.");
    expect(input).toHaveAttribute("aria-describedby", hint.id);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("exposes validation errors accessibly", () => {
    render(<TextField error="Introduce un nombre." label="Nombre del perro" />);

    const input = screen.getByRole("textbox", { name: "Nombre del perro" });
    const alert = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
  });

  it("supports a field without supporting text", () => {
    render(<TextField label="Nombre del perro" />);

    expect(screen.getByRole("textbox", { name: "Nombre del perro" })).not.toHaveAttribute(
      "aria-describedby",
    );
  });
});
