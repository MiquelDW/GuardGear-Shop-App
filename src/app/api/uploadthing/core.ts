import { createUploadthing, type FileRouter } from "uploadthing/next";
// Zod is a TypeScript-first validation library that allows you to define schemas for your data and then validate that data against those schemas. It is often used to validate form data, API responses, or any kind of input that needs to adhere to a specific structure
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/lib/db";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // this route will run once an image has been uploaded by the user
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // define schema where 'configId' is an optional string property
    // .input() receives user input in the defined shape / schema
    .input(z.object({ configId: z.string().optional() }))
    // pass in the received 'input' from the user to the middleware
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // destructure the given 'input' from the middleware inside obj 'metadata'
      const { configId } = metadata.input;

      // fetch the uploaded image from 'uploadThings'
      const res = await fetch(file.url);
      // convert response data into low-level representation of binary data
      // arrayBuffer: use this when working with image, audio, or other non-textual data
      const buffer = await res.arrayBuffer();

      // load the uploaded image inside the buffer using the 'sharp' function
      // extract metadata of the uploaded image from the returned sharp instance
      const imgMetadata = await sharp(buffer).metadata();
      // destructure the width and height from the uploaded image metadata
      const { height, width } = imgMetadata;

      // create new phone case configuration if no 'configId' is passed into this route
      // only activates for step 1, since there will be no 'configId' value available when an user uploads an image for the first time
      if (!configId) {
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.url,
            height: height || 500,
            width: width || 500,
          },
        });

        // return the 'id' of the added phone case configuration
        // this will be returned to 'onClientUploadComplete'
        return { configId: configuration.id };
      } else {
        // if 'configId' already exists and is passed to the route, that means you want to update an existing 'configuration' object in the DB (step 2)
        const updatedConfiguration = await db.configuration.update({
          where: {
            // update phone case config record whose "id" matches given "configId"
            id: configId,
          },
          data: {
            // update the value of the field 'croppedImageUrl' with the url from the given uploaded cropped image
            croppedImageUrl: file.url,
          },
        });

        // return the 'id' of the updated phone case configuration
        return { configId: updatedConfiguration.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
