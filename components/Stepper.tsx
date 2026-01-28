import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type Step = { title: string; description?: string };

export function Stepper({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  const value = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {steps.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;

          return (
            <div key={s.title} className="flex flex-col items-center gap-2 text-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20",
                  !done && !active && "border-border bg-background text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-5 w-5" /> : i + 1}
              </div>

              <div className="hidden sm:block">
                <p className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                  {s.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Progress value={value} />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          الخطوة {currentStep + 1} من {steps.length}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
    </div>
  );
}
