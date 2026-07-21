import {
  Apple,
  Bell,
  Bone,
  ChartNoAxesCombined,
  HeartPulse,
  House,
  Images,
  NotebookPen,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface ProductRoute {
  description: string;
  icon: LucideIcon;
  path: string;
  title: string;
}

export const productRoutes: readonly ProductRoute[] = [
  {
    path: "/",
    title: "Inicio",
    description: "Una vista tranquila de lo importante para tu perro.",
    icon: House,
  },
  {
    path: "/alimentacion",
    title: "Alimentación",
    description: "Comidas, cantidades y rutinas, todo en un mismo lugar.",
    icon: Apple,
  },
  {
    path: "/salud",
    title: "Salud",
    description: "Cuidados, visitas y documentos de salud organizados.",
    icon: HeartPulse,
  },
  {
    path: "/entrenamiento",
    title: "Entrenamiento",
    description: "Aprendizajes y avances construidos paso a paso.",
    icon: Bone,
  },
  {
    path: "/galeria",
    title: "Galería",
    description: "Los momentos que merece la pena conservar.",
    icon: Images,
  },
  {
    path: "/evolucion",
    title: "Evolución",
    description: "Una mirada clara a los cambios a lo largo del tiempo.",
    icon: ChartNoAxesCombined,
  },
  {
    path: "/recordatorios",
    title: "Recordatorios",
    description: "Tareas y fechas importantes sin ruido innecesario.",
    icon: Bell,
  },
  {
    path: "/notas",
    title: "Notas",
    description: "Observaciones cotidianas que ayudan a entender mejor.",
    icon: NotebookPen,
  },
  {
    path: "/ajustes",
    title: "Ajustes",
    description: "Preferencias de la aplicación y del espacio local.",
    icon: Settings,
  },
] as const;
