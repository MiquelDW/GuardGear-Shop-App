import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export type EmailDataType = {
  orderId: string;
  emailTo: string;
  orderDate: string;
  shippingAdressName: string;
  shippingAdressCity: string;
  shippingAdressCountry: string;
  shippingAdressPostalCode: string;
  shippingAdressStreet: string;
  shippingAdressState: string | null;
};

// POST request handler for this webhook API endpoint - POST is the standard HTTP method for sending data to a server (webhook API endpoint), which aligns with the purpose of webhooks -- transmitting event information from Stripe to your application
export async function POST(req: Request) {
  try {
    // read the incoming request body as a string
    const body = await req.text();
    // fetch the value of the "stripe-signature" header from the request
    // this signature is generated using a combination of the payload (the request body) and your webhook secret
    const signature = headers().get("stripe-signature");

    // return bad request Response if value of signature header is empty
    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    // 'constructEvent' function combines the shared webhook secret key and the retrieved payload to recreate the hash (signature) on your server.
    // it then compares this recreated hash to the signature provided in the stripe-signature header (which also created a signature with the shared webhook secret key).
    // if the hashes (signatures) match, the webhook is verified as authentic.
    // this verifies that the request is made by Stripe and not by a random user.
    // if any user can make the request to this API, they can get phone cases for free.
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    // check if the Checkout Session has been successfully completed by the user
    if (event.type === "checkout.session.completed") {
      // throw error if user's email is missing after completing checkout session
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email");
      }

      // retrieve the completed payment checkout session data
      const session = event.data.object as Stripe.Checkout.Session;

      // destructure metadata object from the completed payment checkout session
      // this is the metadata that you constructed in "preview > action.ts"
      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      // throw error if destructured metadata is not null
      if (!userId || !orderId) {
        throw new Error("Invalid request metadata");
      }

      // retrieve the billing- and shipping address of the user from the completed payment checkout session
      const billingAddress = session.customer_details!.address;
      const shippingAddress = session.shipping_details!.address;

      // update order whose 'id' matches the retrieved 'orderId' from the metadata
      const updatedOrder = await db.order.update({
        where: {
          id: orderId,
        },
        data: {
          // Stripe has processed the payment and you've received the money (the user has paid via Stripe)
          isPaid: true,
          // create new shipping- and billing address entries that are automatically linked to the updated order entry
          shippingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: shippingAddress!.city!,
              country: shippingAddress!.country!,
              postalCode: shippingAddress!.postal_code!,
              street: shippingAddress!.line1!,
              state: shippingAddress!.state,
            },
          },
          billingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAddress!.city!,
              country: billingAddress!.country!,
              postalCode: billingAddress!.postal_code!,
              street: billingAddress!.line1!,
              state: billingAddress!.state,
            },
          },
        },
      });

      try {
        // define object that you will be sending to API endpoint '/api/send' to sent email to user
        const emailData: EmailDataType = {
          orderId: orderId,
          emailTo: event.data.object.customer_details?.email,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          shippingAdressName: session.customer_details!.name!,
          shippingAdressCity: shippingAddress!.city!,
          shippingAdressCountry: shippingAddress!.country!,
          shippingAdressPostalCode: shippingAddress!.postal_code!,
          shippingAdressStreet: shippingAddress!.line1!,
          shippingAdressState: shippingAddress!.state!,
        };

        // send order-received email to the user after the payment processing is done
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/send`, {
          method: "POST",
          headers: {
            // indicate you're sending JSON data
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });
      } catch (err) {
        return NextResponse.json(
          { message: `Email could not be send: ${err}`, ok: false },
          { status: 500 },
        );
      }
    }

    // return HTTP response object that contains the completed Checkout Session
    return NextResponse.json({ result: event, ok: true });
  } catch (err) {
    // runs if Webhook signature verification failed for example...
    console.error(err);

    // you can also optionally send the error to an error logging tool that helps to debug (such as 'sentry'), at jobs and enterprise products it's common to do that

    return NextResponse.json(
      { message: `Something went wrong: ${err}`, ok: false },
      { status: 500 },
    );
  }
}
