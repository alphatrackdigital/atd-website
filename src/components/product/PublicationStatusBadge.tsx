import { cn } from "@/lib/utils";
import type { PublicStatus } from "@/types/product";

const STATUS_LABEL: Record<PublicStatus, string> = {
  coming_soon: "Coming soon",
  preview: "Preview",
  available: "Available",
  archived: "Archived",
};

interface PublicationStatusBadgeProps {
  status: PublicStatus;
  className?: string;
}

const PublicationStatusBadge = ({ status, className }: PublicationStatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
      status === "available" && "border-primary/40 bg-primary/[0.08] text-primary",
      className,
    )}
  >
    {STATUS_LABEL[status]}
  </span>
);

export default PublicationStatusBadge;
