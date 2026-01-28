import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        variant === "default" && "bg-primary/10 text-primary border-primary/20",
        variant === "secondary" && "bg-accent/15 text-foreground border-accent/30",
        className
      )}
      {...props}
    />
  );
}
