import type { FC } from "react";
import type { Resource } from "@/models";
import { cn } from "@/lib/utils";
import { TableCell } from "../ui/table";

export interface ResourceTableCellProps
  extends React.HTMLAttributes<HTMLTableCellElement> {
  resourceItem: Resource;
}

// Placeholder avatar shown when a resource has no image configured.
const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="#e2e8f0"/></svg>`,
  );

const ResourceTableCell: FC<ResourceTableCellProps> = ({
  className,
  resourceItem,
  ...props
}) => {
  // Only allow http(s) and inline SVG/data images; anything else (e.g.
  // `javascript:` URLs) falls back to the placeholder avatar.
  const rawImage = resourceItem.details?.image;
  let imageSrc: string | undefined;
  if (typeof rawImage === "string") {
    if (/^(https?:|data:image\/)/i.test(rawImage)) {
      imageSrc = rawImage;
    }
  }
  return (
    <TableCell
      className={cn(
        className,
        "sticky left-0 z-10 border-y bg-background",
      )}
      {...props}
    >
      <div className="flex items-center space-x-4">
        <div className="relative h-10 w-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
            className="rounded-full object-fill"
            src={imageSrc || FALLBACK_AVATAR}
            alt={resourceItem.name}
            referrerPolicy="no-referrer"
          />
        </div>
        <h2>{resourceItem.name}</h2>
      </div>
    </TableCell>
  );
};

export default ResourceTableCell;
