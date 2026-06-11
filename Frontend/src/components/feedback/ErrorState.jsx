import { AlertCircle } from 'lucide-react';

export function ErrorState({ title = 'Something went wrong', description = 'Please try again.' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 px-6 py-10 text-center">
      <AlertCircle className="mb-3 h-6 w-6 text-rose-400" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default ErrorState;
