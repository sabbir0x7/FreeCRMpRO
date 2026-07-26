import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent/50 animate-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
