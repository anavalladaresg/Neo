import { ArrowRight, CalendarDays, Dog, Sparkles } from "lucide-react";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

export function DashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        action={<Badge tone="success">Todo preparado</Badge>}
        description="Un lugar privado para cuidar su historia, sus rutinas y todo lo que compartís."
        eyebrow="Tu espacio Neo"
        title="Buenos días"
      />

      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="welcome-panel__illustration" aria-hidden="true">
          <Dog size={44} strokeWidth={1.35} />
        </div>
        <div className="welcome-panel__copy">
          <Badge icon={Sparkles} tone="accent">
            Primeros pasos
          </Badge>
          <h2 id="welcome-title">Empieza por conocer a tu perro</h2>
          <p>
            Cuando configures su perfil, aquí encontrarás un resumen claro de sus cuidados y
            momentos importantes.
          </p>
        </div>
        <Button disabled icon={ArrowRight} tone="secondary">
          Perfil disponible próximamente
        </Button>
      </section>

      <div className="summary-grid">
        <Card description="La información esencial aparecerá aquí." title="Perfil del perro">
          <div className="summary-line">
            <span className="summary-line__icon" aria-hidden="true">
              <Dog size={20} strokeWidth={1.6} />
            </span>
            <div>
              <strong>Todavía no configurado</strong>
              <span>Añadirás el perfil en el siguiente paso del proyecto.</span>
            </div>
          </div>
        </Card>

        <Card description="Fechas y cuidados que merecen atención." title="Próximos recordatorios">
          <div className="summary-line">
            <span className="summary-line__icon summary-line__icon--accent" aria-hidden="true">
              <CalendarDays size={20} strokeWidth={1.6} />
            </span>
            <div>
              <strong>Sin recordatorios</strong>
              <span>Este espacio se mantendrá tranquilo hasta que añadas uno.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
