// server action modules contain server-side logic in RPC functions
"use server";

import { getLoggedInUser } from "@/data/users";
import { db } from "@/lib/db";

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  if (!orderId) throw new Error("No order ID given");

  // retrieve logged in user that wants to pay for the configured phone case
  const currentUser = await getLoggedInUser();
  if (!currentUser) throw new Error("You need to be logged in!");

  // retrieve the given paid order from the logged-in user
  const order = await db.order.findUnique({
    where: { id: orderId, userId: currentUser.id },
    // also fetch the related records of the retrieved order entry (SQL join syntax)
    include: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true,
      User: true,
    },
  });
  if (!order) throw new Error("This order does not exist");

  // return the retrieved order entry with the related records if the retrieved order has been paid by the user
  if (order.isPaid) {
    return order;
  } else {
    return false;
  }
};
