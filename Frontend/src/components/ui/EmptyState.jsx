'use client';

import { Button } from './Button.jsx';
import { Card, CardBody } from './Card.jsx';

export function EmptyState({ title, description, actionLabel, onAction, icon: Icon }) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center justify-center py-14 text-center">
        {Icon ? <Icon className="mb-4 h-10 w-10 text-primary" /> : null}
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
        {actionLabel ? (
          <Button variant="primary" className="mt-6" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}

export default EmptyState;
