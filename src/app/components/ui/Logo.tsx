import React from 'react';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={cn("h-8 w-8 drop-shadow-md", className)}
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      <polygon 
        points="50,5 90,25 90,75 50,95 10,75 10,25" 
        fill="url(#brandGradient)" 
      />
      
      <polygon 
        points="50,20 75,35 75,65 50,80 25,65 25,35" 
        fill="url(#glassGradient)" 
      />
      
      <path 
        d="M50 20 L50 50 L75 65 M50 50 L25 65" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="50" cy="50" r="10" fill="white" />
      <circle cx="50" cy="50" r="5" fill="url(#brandGradient)" />
    </svg>
  );
}

export function LogoText({ className }: { className?: string }) {
  return (
    <div className={cn("text-xl font-bold tracking-tight text-foreground drop-shadow-sm", className)}>
      FreeCRM<span className="text-[var(--brand)]">pRO</span>
    </div>
  );
}

export function Logo({ 
  className, 
  iconClassName, 
  textClassName, 
  onClick 
}: { 
  className?: string; 
  iconClassName?: string; 
  textClassName?: string; 
  onClick?: () => void;
}) {
  return (
    <div 
      className={cn("flex items-center gap-2 cursor-pointer transition-transform hover:scale-105", className)} 
      onClick={onClick}
    >
      <LogoIcon className={iconClassName} />
      <LogoText className={textClassName} />
    </div>
  );
}
