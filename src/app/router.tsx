import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ComponentShowcasePage } from "../pages/ComponentShowcasePage";
import { DashboardPage } from "../pages/DashboardPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { WorkspaceSettingsPage } from "../pages/WorkspaceSettingsPage";
import { productRoutes } from "./routes";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        {productRoutes.slice(1).map((route) => (
          <Route
            key={route.path}
            path={route.path.slice(1)}
            element={
              route.path === "/ajustes" ? (
                <WorkspaceSettingsPage />
              ) : (
                <PlaceholderPage route={route} />
              )
            }
          />
        ))}
        <Route path="componentes" element={<ComponentShowcasePage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}

export function AppRouter() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
