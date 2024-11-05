// Your local server (on localhost:3000) is not publicy accessible, meaning Clerk can't directly send webhook requests to it. Localhost is only accessible from your own computer, not from the internet.
// Ngrok creates a secure tunnel between your localhost and the internet. When you run ngrok http 3000, it generates a public URL that is mapped to your local server running on port 3000. This exposes your local server’s port 3000 to the internet. This allows external services like Clerk to send HTTP requests to your local development environment via a public URL.
// The given response from your server travels back through the same ngrok tunnel to Clerk. Clerk registers that the webhook was received and processed successfully or unsuccessfully.

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import { createUser, deleteUser, updateUser } from "@/data/users";

// Clerk notifies the application whenever certain events occur (like sign-ups, user updates etc) by sending an HTTP POST request to a specific URL -- this is the webhook.
// The app securely processes the webhook request, it reads the incoming data (e.g., user information, event type) and verifies that the given data is send by Clerk using Svix.
// After verifying, the server performs some action, like updating your database or triggering another process.
// After successfully processing the webhook and performing an action, your server sends back an HTTP response to Clerk, often a simple acknowledgment like a 200 OK status code.
export const POST = async (req: Request) => {
  // retrieve webhook secret and return error if there's no webhooks secret
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // get the headers from the incoming request
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // if there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  // verify that the payload is coming from Clerk using Svix
  try {
    // Svix combines the headers and the request body/payload, then uses the WEBHOOK_SECRET to recreate the hash (signature) on your server.
    // it compares this computed hash to the 'svix-signature' sent by Clerk (which also created a signature with the shared WEBHOOK_SECRET).
    // if the hashes (signatures) match, the webhook is verified as authentic
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  switch (evt.type) {
    // create new user if webhook event is of type 'user.created'
    case "user.created":
      // retrieve user data from the webhook event
      const { id, email_addresses } = evt.data;

      if (!id || !email_addresses) {
        return new Response("Error occured -- missing data", { status: 400 });
      }

      // check if user already exists in the db
      const existingUser = await db.user.findUnique({
        where: { id: id },
      });

      // return error if user already exists
      if (existingUser)
        return new Response("Something went wrong! Please contact us.", {
          status: 400,
        });

      // create new user object in db if user doesn't exist yet
      if (!existingUser) {
        const user = {
          id: id,
          email: email_addresses[0].email_address,
        };
        await createUser(user as User);
      }
      break;
    // update user if webhook event is of type 'user.updated'
    case "user.updated": {
      // retrieve updated user data from the webhook event
      const { id, email_addresses } = evt.data;

      if (!id || !email_addresses) {
        return new Response("Error occured -- missing data", { status: 400 });
      }

      // check if user already exists in the db
      const existingUser = await db.user.findFirst({
        where: { id: id },
      });

      // return error if user doesn't exist
      if (!existingUser) return new Response("No user found", { status: 400 });

      // update retrieved user in db
      const updatedUserData = {
        email: email_addresses[0].email_address,
      };
      await updateUser(existingUser.id, updatedUserData);
      break;
    }
    case "user.deleted": {
      // retrieve updated user data from the webhook event
      const { id } = evt.data;

      if (!id) {
        return new Response("Error occured -- missing data", { status: 400 });
      }

      // check if user already exists in the db
      const existingUser = await db.user.findFirst({
        where: { id: id },
      });

      // return error if user doesn't exist
      if (!existingUser) return new Response("No user found", { status: 400 });

      // delete retrieved user from db
      await deleteUser(existingUser.id);
    }
  }

  // display event info and retrieved payload to the console
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  // console.log("Webhook body:", body);

  return new Response("", { status: 200 });
};
