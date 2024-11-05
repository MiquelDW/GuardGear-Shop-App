// server action modules contain server-side logic in RPC functions
"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/data/config/products";
import { getLoggedInUser } from "@/data/users";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { Order } from "@prisma/client";

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string;
}) => {
  // retrieve logged in user that wants to pay for the configured phone case
  const currentUser = await getLoggedInUser();
  if (!currentUser) throw new Error("You need to be logged in!");

  // find the phone case config whose 'id' matches the given 'configId'
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });
  if (!configuration) throw new Error("No such configuration found!");

  // destructure configured "finish" and "material" options from retrieved config
  const { finish, material } = configuration;

  // re-calc the total price of the configured phone case by the user
  // you don't want to receive the total price from the client, because the user can change and manipulate the total price client-side
  let totalPrice = BASE_PRICE;
  if (finish === "textured") totalPrice += PRODUCT_PRICES.finish.textured;
  if (material === "polycarbonate")
    totalPrice += PRODUCT_PRICES.material.polycarbonate;

  // check in the DB if user already ordered the retrieved configuration
  const existingOrder = await db.order.findFirst({
    where: {
      userId: currentUser.id,
      configurationId: configuration.id,
    },
  });

  let order: Order | undefined = undefined;
  if (existingOrder) {
    // assign the existing order object to the "order" object
    order = existingOrder;
  } else {
    // create new order in db and assign it to the "order" object
    order = await db.order.create({
      data: {
        amount: totalPrice / 100,
        // assign appropriate values to the foreign keys
        userId: currentUser.id,
        configurationId: configuration.id,
      },
    });
  }

  // tell stripe what product the user is buying
  const product = await stripe.products.create({
    name: "Custom iPhone Case",
    images: [configuration.imageUrl],
    default_price_data: {
      // configure price formatting and data
      currency: "USD",
      unit_amount: totalPrice,
    },
  });

  // create payment session with the product the user is buying
  const stripeSession = await stripe.checkout.sessions.create({
    // redirect user to the specified route if payment was successful
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    // redirect user to the specified route if payment was cancelled
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    // configure payment methods
    payment_method_types: ["card", "paypal"],
    // configure the type of the checkout session (payment, subscription etc)
    mode: "payment",
    // configure allowed countries to ship orders to
    shipping_address_collection: { allowed_countries: ["DE", "US", "NL"] },
    // configure metadata about the payment session that you can receive after a payment was successful to know which user paid and which order needs to be shipped
    metadata: {
      userId: currentUser.id,
      orderId: order.id,
    },
    // configure what the customer is purchasing
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  });

  // return an object with an "url" prop containing the url to the checkout page hosted by Stripe
  // if user is navigated to this url, the configured payment session starts
  return { url: stripeSession.url };
};
