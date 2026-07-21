import type { WorkspaceNameErrorCode } from "./domain/workspace-name";
import type { WorkspaceErrorCode } from "./workspace-errors";

export const workspaceCopy = {
  onboarding: {
    eyebrow: "Tu espacio local",
    title: "Tus datos, siempre contigo",
    description: "Neo guarda toda la información en una carpeta local que tú eliges.",
    createAction: "Crear espacio de trabajo",
    openAction: "Abrir espacio existente",
  },
  success: {
    created: "Espacio de trabajo creado correctamente.",
    opened: "Espacio de trabajo abierto correctamente.",
  },
} as const;

const workspaceNameMessages: Record<WorkspaceNameErrorCode, string> = {
  dot_only: "El nombre debe incluir letras o números.",
  path_traversal: "El nombre no puede salir de la carpeta seleccionada.",
  prohibited_character: 'El nombre no puede contener < > : " / \\ | ? *.',
  required: "Escribe un nombre para el espacio de trabajo.",
  reserved_name: "Ese nombre está reservado por Windows. Elige otro.",
  too_long: "El nombre puede tener como máximo 80 caracteres.",
  trailing_period: "El nombre no puede terminar con un punto.",
};

const workspaceErrorMessages: Record<WorkspaceErrorCode, { description: string; title: string }> = {
  access_denied: {
    title: "No se puede acceder a esa carpeta",
    description: "Comprueba sus permisos o elige otra ubicación.",
  },
  destination_conflict: {
    title: "Ya existe una carpeta con ese nombre",
    description: "Neo no reemplazará ningún archivo. Elige otro nombre o ubicación.",
  },
  invalid_name: {
    title: "El nombre no es válido",
    description: "Revisa el nombre del espacio de trabajo e inténtalo de nuevo.",
  },
  invalid_path: {
    title: "La ubicación no es segura",
    description: "Elige directamente una carpeta local válida.",
  },
  malformed_manifest: {
    title: "El espacio está dañado",
    description: "No se puede leer workspace.json. El archivo no se ha modificado.",
  },
  not_workspace: {
    title: "Esta carpeta no es un espacio de Neo",
    description: "Selecciona una carpeta que contenga un workspace.json válido.",
  },
  selection_expired: {
    title: "Vuelve a elegir la carpeta",
    description: "La selección anterior ya no está disponible por seguridad.",
  },
  settings_unavailable: {
    title: "No se pudo recordar el espacio",
    description: "Tus datos siguen intactos. Puedes volver a abrir la carpeta manualmente.",
  },
  unsupported_schema: {
    title: "Esta versión de Neo no puede abrir el espacio",
    description: "El espacio fue creado con una versión más reciente. No se ha modificado.",
  },
  unexpected: {
    title: "No se pudo completar la operación",
    description: "Nada se ha reemplazado. Inténtalo de nuevo o elige otra carpeta.",
  },
  write_failed: {
    title: "No se pudo crear el espacio",
    description: "Neo ha cancelado la creación sin reemplazar archivos existentes.",
  },
};

export function getWorkspaceNameMessage(code: WorkspaceNameErrorCode): string {
  return workspaceNameMessages[code];
}

export function getWorkspaceErrorMessage(code: WorkspaceErrorCode) {
  return workspaceErrorMessages[code];
}
