"use client";

import {
  CSSProperties,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
// framer-motion is one of the most popular React animation libraries
// 'useInView' is a hook from framer-motion to check if something in the viewport
import { useInView } from "framer-motion";
// 'cn' helper function to merge default classNames with other classNames and to conditionally add classnames
import { cn } from "@/lib/utils";
import Phone from "./Phone";

// phones that will be used inside the animation
const PHONES = [
  "/testimonials/1.jpg",
  "/testimonials/2.jpg",
  "/testimonials/3.jpg",
  "/testimonials/4.jpg",
  "/testimonials/5.jpg",
  "/testimonials/6.jpg",

  /* 
  1.
  i = 0: index = 0 % 3 = 0
  result[0] is initialized as an empty array.
  PHONES[0] ("/testimonials/1.jpg") is pushed into result[0].

  2.
  i = 1: index = 1 % 3 = 1
  result[1] is initialized as an empty array.
  PHONES[1] ("/testimonials/2.jpg") is pushed into result[1].

  3.
  i = 2: index = 2 % 3 = 2
  result[2] is initialized as an empty array.
  PHONES[2] ("/testimonials/3.jpg") is pushed into result[2].

  4.
  i = 3: index = 3 % 3 = 0
  PHONES[3] ("/testimonials/4.jpg") is pushed into result[0].

  5.
  i = 4: index = 4 % 3 = 1
  PHONES[4] ("/testimonials/5.jpg") is pushed into result[1].

  6.
  i = 5: index = 5 % 3 = 2
  PHONES[5] ("/testimonials/6.jpg") is pushed into result[2]. 
  */

  // Index 0, 3 go to the first sub-array (index 0)
  // Index 1, 4 go to the second sub-array (index 1)
  // Index 2, 5 go to the third sub-array (index 2)

  // The result will be:
  // [
  //   ["/testimonials/1.jpg", "/testimonials/4.jpg"],
  //   ["/testimonials/2.jpg", "/testimonials/5.jpg"],
  //   ["/testimonials/3.jpg", "/testimonials/6.jpg"]
  // ]
];

// generic function that takes in a generic array and splits it into the given number of parts / columns (numParts)
// you need to make the function generic to allow it to work with arrays of any type
function splitArray<T>(array: Array<T>, numParts: number) {
  // initialize an empty array 'results' to hold the sub-arrays
  // 'result' is an array of arrays where each inner array holds elements of type 'T' (specified using generics)
  const result: Array<Array<T>> = [];

  // iterate over each element in the given 'array'
  for (let i = 0; i < array.length; i++) {
    // calculate the index of the sub-array to place the element using the modulo operator (i % numParts)
    const index = i % numParts;

    // if the sub-array at that index does not exist, initialize the sub-array as an empty array
    if (!result[index]) {
      result[index] = [];
    }

    // push the current element into the the approriate sub-array
    result[index].push(array[i]);
  }

  // return the array 'results' that contains the sub-arrays
  return result;
}

// Animated columns that holds each individual phone
function PhoneColumn({
  phones,
  className,
  // add classnames conditionally to the column based on the 'phoneIndex'
  phoneClassName,
  // how fast should the column animation move
  msPerPixel = 0,
}: {
  phones: string[];
  className?: string;
  phoneClassName?: (phoneIndex: number) => string;
  msPerPixel?: number;
}) {
  // assign given 'ref' object to the <div> element (column container)
  const columnRef = useRef<HTMLDivElement | null>(null);

  // state variable that keeps track of the current column's height
  const [columnHeight, setColumnHeight] = useState(0);
  // console.log(columnHeight);

  // calc the duration of the column animation (in ms)
  // duration of the column animation needs to respect the current height of the column, otherwise the animation looks very weird on different column heights
  // the higher the columns get, the longer it takes for the column animation to complete
  const duration = `${columnHeight * msPerPixel}ms`;

  // useEffect hook that updates the state variable 'columnHeight' if the user resizes the browser, which triggers a re-render to recalculate the column animation duration
  useEffect(() => {
    if (!columnRef.current) return;

    // callback function activates on initial load and whenever the dimensions of the observed element(s) changes
    const resizeObserver = new window.ResizeObserver(() => {
      // update state variable 'columnHeight'
      // return the current height of column <div> container
      setColumnHeight(columnRef.current?.offsetHeight ?? 0);
    });

    // initiate the observing of the <div> container for size changes
    resizeObserver.observe(columnRef.current);

    // clean-up function to avoid memory leaks that could lead to unexepected behaviour
    return () => {
      // unobserve the "target element" of the observer
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      // assign given 'ref' object to the <div> element (column container)
      ref={columnRef}
      className={cn("animate-marquee space-y-8 py-4", className)}
      // cast the type of "--marquee-duration" as 'CSSProperties' because its not a recognized CSS prop
      // "--marquee-duration" is a custom CSS prop / variable set to the current value of 'duration'
      style={{ "--marquee-duration": duration } as CSSProperties}
    >
      {/* show each individual phone inside the phone column */}
      {/* merge array 'phones' with itself to show more elements in the column (basically dupes each array element) */}
      {phones.concat(phones).map((imgSrc, phoneIndex) => {
        return (
          <IndividualPhone
            key={phoneIndex}
            // invoke 'phoneClassName()' to generate the necessary tailwind classes
            className={phoneClassName?.(phoneIndex % phones.length)}
            imgSrc={imgSrc}
          />
        );
      })}
    </div>
  );
}

// predefine object structure for the given 'props' object
// inherit all standard 'div' attributes like 'id', 'className', etc
interface IndividualPhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
}

// individual phone inside a phone column
function IndividualPhone({
  imgSrc,
  className,
  // collect all the other given props with the rest operator
  ...props
}: IndividualPhoneProps) {
  // possible values for animation delay
  // give each individual phone an animation delay so they pop-up at different times
  const POSSIBLE_ANIMATION_DELAYS = [
    "0s",
    "0.1s",
    "0.2s",
    "0.3s",
    "0.4s",
    "0.5s",
  ];

  // grab a singular animation delay value randomly
  const animationDelay =
    POSSIBLE_ANIMATION_DELAYS[
      // generates random number from 0 to 5
      Math.floor(Math.random() * POSSIBLE_ANIMATION_DELAYS.length)
    ];

  return (
    <div
      className={cn(
        "animate-fade-in rounded-[2.25rem] bg-white p-6 opacity-0 shadow-xl shadow-slate-900/5",
        className,
      )}
      // 'animationDelay' is a recognized CSS property
      // use the random value inside 'animationDelay' to add animation delay
      style={{ animationDelay }}
      // spread out all the other given props in the <div> element
      {...props}
    >
      <Phone imgSrc={imgSrc} />
    </div>
  );
}

// Grid that holds each animated column
function PhoneGrid() {
  // ref object that points to the <div> container to directly interact and manipulate the component
  const containerRef = useRef<HTMLDivElement | null>(null);

  // check if the container <div> element is inside the user's viewport
  // only animate the first time the div container is inside the viewport
  // start animating when the user is a bit past the div container
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });

  // construct the columns for the animation
  const columns = splitArray(PHONES, 3);
  const column1 = columns[0]; // [1st, 4th] testimonial pics
  const column2 = columns[1]; // [2nd, 5th] testimonial pics
  const column3 = splitArray(columns[2], 2); // [[3th], [6th]] testimonial pics
  // console.log(column1);
  // console.log(column2);
  // console.log(column3);
  // console.log([...column1, ...column3.flat(), ...column2]);

  return (
    <div
      // assign given 'ref' object to the <div> element (container)
      ref={containerRef}
      className="relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
    >
      {/* render the columns if the div container is inside the user's viewport */}
      {isInView && (
        <>
          {/* Left Column (grid-cols-1, grid-cols-2, grid-cols-3) */}
          <PhoneColumn
            phones={[...column1, ...column3.flat(), ...column2]}
            // pass in function definition that adds classnames to each given individual phone
            phoneClassName={(phoneIndex) => {
              // console.log(
              //   `LEFT COLUMN ${phoneIndex}: `,
              //   phoneIndex % [...column1, ...column3.flat(), ...column2].length,
              // );

              // hides 3th column pics at md in this PhoneColumn
              // hides 2th columns pcis at lg in this PhoneColumn
              const hiddenMedium = column1.length + column3[0].length;
              const hiddenLarge = column1.length;
              return cn({
                "md:hidden": phoneIndex >= hiddenMedium,
                "lg:hidden": phoneIndex >= hiddenLarge,
              });
            }}
            msPerPixel={10}
          />

          {/* Middle Column (grid-cols-2, grid-cols-3) */}
          <PhoneColumn
            phones={[...column2, ...column3[1]]}
            className="hidden md:block"
            // pass in function definition that adds classnames to each given individual phone
            phoneClassName={(phoneIndex) => {
              // console.log(
              //   `MEDIUM COLUMN ${phoneIndex}: `,
              //   phoneIndex % [...column2, ...column3[1]].length,
              // );

              // hides 3th column pic at lg in this PhoneColumn
              const hiddenLarge = column2.length;
              return phoneIndex >= hiddenLarge ? "lg:hidden" : "";
            }}
            msPerPixel={15}
          />

          {/* Right Column (grid-cols-3) */}
          <PhoneColumn
            phones={column3.flat()}
            className="hidden md:block"
            msPerPixel={10}
          />
        </>
      )}
      <div className="pointer-events-none absolute inset-x-0 -top-1 h-32 bg-gradient-to-b from-slate-100" />
      <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-32 bg-gradient-to-t from-slate-100" />
    </div>
  );
}

export default function Phones() {
  return (
    <MaxWidthWrapper className="relative max-w-5xl">
      {/* this image will show because the hero <section> creates the space it needs to show */}
      <img
        // hide this image from screen readers
        aria-hidden="true"
        src="/what-people-are-buying.png"
        className="absolute -left-32 top-1/3 hidden select-none xl:block"
      />

      {/* entire phone animation grid */}
      <PhoneGrid />
    </MaxWidthWrapper>
  );
}
