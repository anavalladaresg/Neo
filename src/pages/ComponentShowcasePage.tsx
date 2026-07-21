import { useState } from "react";

import { FolderOpen, RotateCcw } from "lucide-react";

import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import { LoadingState } from "../components/feedback/LoadingState";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { TextField } from "../components/ui/TextField";

export function ComponentShowcasePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="page-stack">
      <PageHeader
        action={<Badge tone="neutral">Vista de desarrollo</Badge>}
        description="Una referencia interna para revisar estados, controles y comportamiento accesible."
        eyebrow="Sistema de diseño"
        title="Componentes compartidos"
      />

      <div className="showcase-grid">
        <Card title="Estados de la interfaz">
          <div className="showcase-stack">
            <EmptyState
              action={<Button tone="secondary">Añadir información</Button>}
              description="Cuando añadas contenido, aparecerá organizado en este espacio."
              icon={FolderOpen}
              title="Todavía no hay información"
            />
            <LoadingState description="Solo tardará un momento." title="Preparando tu espacio" />
            <ErrorState
              action={<Button tone="quiet">Intentar de nuevo</Button>}
              description="Tus datos siguen a salvo. Vuelve a intentarlo cuando estés preparado."
              title="No hemos podido cargar la información"
            />
          </div>
        </Card>

        <Card title="Controles y confirmación">
          <div className="showcase-stack">
            <TextField
              defaultValue="Neo"
              hint="Puedes cambiarlo más adelante."
              label="Nombre del perro"
            />
            <TextField error="Introduce un nombre para continuar." label="Ejemplo con error" />
            <TextField label="Ejemplo sencillo" placeholder="Escribe aquí" />
            <Button icon={RotateCcw} onClick={() => setDialogOpen(true)} tone="danger">
              Abrir confirmación
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmationDialog
        confirmLabel="Quitar ejemplo"
        description="Esta acción solo demuestra el comportamiento del diálogo y no modifica ningún dato."
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => setDialogOpen(false)}
        open={dialogOpen}
        title="¿Quieres quitar este ejemplo?"
      />
    </div>
  );
}
