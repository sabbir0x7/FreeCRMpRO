import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "glass-input resize-none placeholder:text-muted-foreground selection:bg-brand selection:text-brand-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-lg px-3 py-2 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-sm focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
