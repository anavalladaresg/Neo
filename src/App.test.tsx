import { invoke } from "@tauri-apps/api/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const mockedInvoke = vi.mocked(invoke);

describe("generated Tauri scaffold", () => {
  beforeEach(() => {
    mockedInvoke.mockReset();
  });

  it("renders the framework links and greeting form", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Welcome to Tauri + React" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Vite logo" })).toHaveAttribute(
      "href",
      "https://vite.dev",
    );
    expect(screen.getByRole("link", { name: "Tauri logo" })).toHaveAttribute(
      "href",
      "https://tauri.app",
    );
    expect(screen.getByRole("link", { name: "React logo" })).toHaveAttribute(
      "href",
      "https://react.dev",
    );
    expect(screen.getByPlaceholderText("Enter a name...")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Greet" })).toBeEnabled();
  });

  it("submits the entered name through the Tauri command boundary", async () => {
    const user = userEvent.setup();
    mockedInvoke.mockResolvedValue("Hello, Neo! You've been greeted from Rust!");
    render(<App />);

    await user.type(screen.getByPlaceholderText("Enter a name..."), "Neo");
    await user.click(screen.getByRole("button", { name: "Greet" }));

    expect(mockedInvoke).toHaveBeenCalledWith("greet", { name: "Neo" });
    expect(await screen.findByText("Hello, Neo! You've been greeted from Rust!")).toBeVisible();
  });
});
