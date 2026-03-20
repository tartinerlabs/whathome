import type { Metadata } from "next";
import { PreviewShell } from "./_components/preview-shell";

export const metadata: Metadata = {
  title: "Design Preview | WhatHome",
  description:
    "Compare full and soft neobrutalist design variants for WhatHome — Singapore's property research directory.",
};

export default function PreviewPage() {
  return <PreviewShell />;
}
