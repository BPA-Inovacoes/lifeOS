import * as React from "react";

import { techCardAccentClass, techCardClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(techCardClass, "shadow-none", className)} {...props}>
      <div className={techCardAccentClass} aria-hidden />
      {children}
    </div>
  );
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex flex-col space-y-1.5 border-b border-zinc-800 p-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-zinc-500", className)} {...props} />
  );
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative p-6 pt-4", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
