import type { ReactNode } from "react";
import { ViewTransition } from "react";

const transitionTypes = ["transition-to-detail", "transition-to-list"] as const;

const animationTypes = [
  "auto",
  "none",
  "animate-slide-from-left",
  "animate-slide-from-right",
  "animate-slide-to-left",
  "animate-slide-to-right",
  "animate-morph",
] as const;

type TransitionType = (typeof transitionTypes)[number];
type AnimationType = (typeof animationTypes)[number];

type TransitionMap = { default: AnimationType } & Partial<
  Record<TransitionType, AnimationType>
>;

type TransitionId =
  | "navigation-title"
  | `project-image-${string}`
  | `project-title-${string}`;

interface PageTransitionProps {
  children: ReactNode;
  enter: TransitionMap;
  exit: TransitionMap;
}

export function PageTransition({ children, enter, exit }: PageTransitionProps) {
  return (
    <ViewTransition enter={enter} exit={exit}>
      {children}
    </ViewTransition>
  );
}

interface SharedTransitionProps {
  children: ReactNode;
  name: TransitionId;
  share?: TransitionMap;
}

export function SharedTransition({
  children,
  name,
  share = {
    default: "auto",
    "transition-to-list": "animate-morph",
    "transition-to-detail": "animate-morph",
  },
}: SharedTransitionProps) {
  return (
    <ViewTransition name={name} share={share}>
      {children}
    </ViewTransition>
  );
}
