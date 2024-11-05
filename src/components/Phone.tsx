// use 'cn' helper function to merge the default classNames with the given classNames send as a prop
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// predefine object structure for the given 'props' object
// inherit all standard 'div' attributes like 'id', 'className', etc
interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  dark?: boolean;
}

// reusable component that displays a phonecase with a given phonecase-img
const Phone = ({
  imgSrc,
  className,
  dark = false,
  // collect all the other given props with the rest operator
  ...props
}: PhoneProps) => {
  return (
    <div
      className={cn(
        // create new stacking context that stacks the child elements relative to the parent, not the default document flow.
        "pointer-events-none relative z-50 overflow-hidden",
        className,
      )}
      // spread out all the other given props in the <div> element
      {...props}
    >
      {/* transparent phone case (z-50: shows on top of given phonecase-img) */}
      <img
        src={
          dark
            ? "/phone-template-dark-edges.png"
            : "/phone-template-white-edges.png"
        }
        className="pointer-events-none z-50 select-none"
        alt="phone image"
      />

      {/* image inside the phone case (-z-10: shows below phonecase) */}
      <div className="absolute inset-0 -z-10">
        <img
          src={imgSrc}
          className="min-h-full min-w-full object-cover"
          alt="overlaying phone image"
        />
      </div>
    </div>
  );
};

export default Phone;
