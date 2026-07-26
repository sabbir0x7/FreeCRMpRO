"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "glass-card group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:border-white/20 dark:group-[.toaster]:border-white/10 group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-sm group-[.toast]:font-medium transition-colors hover:group-[.toast]:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-sm group-[.toast]:font-medium transition-colors hover:group-[.toast]:bg-muted/90",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
