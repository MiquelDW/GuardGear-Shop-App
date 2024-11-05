// 'cn' helper function to merge default classNames with other classNames and to conditionally add classnames
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// reusable wrapper component that creates consistent padding, width etc on elements across the application
const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto h-full w-full max-w-screen-xl px-2.5 md:px-20",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
