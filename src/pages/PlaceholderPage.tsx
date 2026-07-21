import { Clock3 } from "lucide-react";

import type { ProductRoute } from "../app/routes";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

interface PlaceholderPageProps {
  route: ProductRoute;
}

export function PlaceholderPage({ route }: PlaceholderPageProps) {
  const Icon = route.icon;

  return (
    <div className="page-stack">
      <PageHeader
        action={<Badge tone="neutral">En preparación</Badge>}
        description={route.description}
        eyebrow="Neo"
        title={route.title}
      />

      <Card className="placeholder-card">
        <div className="placeholder-card__icon" aria-hidden="true">
          <Icon size={34} strokeWidth={1.45} />
        </div>
        <div className="placeholder-card__copy">
          <Badge icon={Clock3} tone="warning">
            Próximamente
          </Badge>
          <h2>Estamos preparando este espacio</h2>
          <p>
            Esta sección llegará en una próxima versión. Por ahora, puedes recorrer Neo y
            familiarizarte con su organización.
          </p>
        </div>
      </Card>
    </div>
  );
}
