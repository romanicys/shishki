import { ReactNode } from "react";

import { PageSurface } from "@/components/PageSurface";

export default function PostsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PageSurface>{children}</PageSurface>;
}
