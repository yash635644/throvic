"use client";

import { MotionConfig } from "motion/react";

/** Honour the visitor's "reduce motion" setting in motion-animated parts. Used only on pages that animate with motion, so other pages don't load it. */
export function ReducedMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
