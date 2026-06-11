import { CheckCircle2 } from 'lucide-react';

export function SuccessState({ title = 'Success', description = 'Your changes have been saved.' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-10 text-center">
      <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-400" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default SuccessState;
