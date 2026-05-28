import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-2xl border border-border/15 bg-surface/60 px-4 py-3 text-[15px] text-fg " +
  "placeholder:text-muted/60 transition-colors focus:border-accent/60 focus:outline-none " +
  "focus:ring-4 focus:ring-accent/10";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-muted">
      {children}
    </label>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-accent">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-muted/70">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={cn(inputBase, props.className)} />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={cn(inputBase, "min-h-[110px] resize-y leading-relaxed", props.className)} />
);
