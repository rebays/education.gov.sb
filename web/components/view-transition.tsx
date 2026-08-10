"use client";

interface ViewTransitionProps {
  children: React.ReactNode;
  enter: string;
  exit: string;
}

export function ViewTransition({ children, enter, exit }: ViewTransitionProps) {
  return <>{children}</>;
}
