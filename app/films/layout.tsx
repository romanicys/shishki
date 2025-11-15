import { ReactNode } from "react";

import { PageSurface } from "@/components/PageSurface";

export default function FilmsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PageSurface>{children}</PageSurface>;
}
