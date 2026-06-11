'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { PageHeader, Card, CardBody, Badge } from '@/components/ui';

export function PlaceholderPage({
  eyebrow = 'Trimly Workspace',
  title,
  description,
  badge = 'Ready',
  items = [],
}) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader eyebrow={eyebrow} title={title} description={description}>
          <Badge variant="gold">{badge}</Badge>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-3">
          {(items.length ? items : ['Shared layout', 'Navigation wired', 'Module-ready']).map((item) => (
            <Card key={item}>
              <CardBody className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

export default PlaceholderPage;
