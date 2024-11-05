// server action modules contain server-side logic in RPC functions
"use server";

import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function ChangeOrderStatus({
  orderId,
  newStatus,
}: {
  orderId: string;
  newStatus: OrderStatus;
}) {
  // update order entry whose 'id' matches the given 'orderId'
  await db.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
}
