// use the DB client to access and manipulate the database
import { db } from "@/lib/db";
import DesignConfigurator from "./DesignConfigurator";
// navigate users to the specified routes without a full page reload
import Link from "next/link";

// predefine object structure for given 'props' object
interface DesignProps {
  // 'searchParams' prop contains dynamic query parameters from the current URL
  searchParams: {
    // use index signature to tell TS that 'searchParams' obj can have any number of properties, each with a key of union type string | string[] | undefined
    // index signatures allow you to define the types for properties of an object when you don't know the exact prop names
    [key: string]: string | string[] | undefined;
  };
}

const Design = async ({ searchParams }: DesignProps) => {
  // destructure the dynamic query param 'id' from the given 'searchParams' obj
  const { id } = searchParams;

  // display not found page if given dynamic query param 'id' is null or not valid
  if (!id || typeof id !== "string") {
    return (
      <div className="mt-24 flex w-full justify-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-semibold">Configuration not found!</h3>
          <p>
            Refresh the page or Click{" "}
            <Link
              href="/configure/upload"
              className="underline underline-offset-2 hover:text-primary"
            >
              here
            </Link>{" "}
            to make another configuration.
          </p>
        </div>
      </div>
    );
  }

  // get phone case config whose 'id' matches the given dynamic query param 'id'
  // retrieved config holds data about the uploaded img by the user (after step 1)
  const configuration = await db.configuration.findUnique({
    where: { id },
  });

  // display not found page if phone case config couldn't be found
  if (!configuration) {
    return (
      <div className="mt-24 flex w-full justify-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-semibold">Configuration not found!</h3>
          <p>
            Refresh the page or Click{" "}
            <Link
              href="/configure/upload"
              className="underline underline-offset-2 hover:text-primary"
            >
              here
            </Link>{" "}
            to make another configuration.
          </p>
        </div>
      </div>
    );
  }

  // retrieve the fields from the retrieved phone case config entry
  const { imageUrl, width, height } = configuration;

  return (
    <DesignConfigurator
      // pass in the props to correctly display the uploaded image by user
      configId={configuration.id}
      imageUrl={imageUrl}
      imageDimensions={{ width, height }}
    />
  );
};

export default Design;
