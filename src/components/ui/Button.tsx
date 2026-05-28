import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium select-none " +
  "transition-all duration-200 ease-smooth focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-accent to-accent-2 text-[#0d0c11] shadow-glow hover:brightness-105 hover:-translate-y-[1px]",
  secondary:
    "border border-border/15 bg-surface/70 text-fg backdrop-blur hover:border-border/30 hover:bg-surface",
  ghost: "text-muted hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };
type LinkProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children"> & {
    href: string;
  };

/**
 * One button that renders either a <button> or a Next <Link> depending on
 * whether `href` is passed. Style props (variant/size/className) are stripped
 * before spreading the remaining native attributes onto the element.
 */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const rest: Record<string, unknown> = { ...props };
  delete rest.variant;
  delete rest.size;
  delete rest.className;
  delete rest.children;

  if ("href" in props && typeof props.href === "string") {
    return (
      <Link href={props.href} className={classes} {...(rest as Record<string, unknown>)}>
        {children}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <button className={classes} {...(rest as any)}>
      {children}
    </button>
  );
}
