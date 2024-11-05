import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import StatusDropdown from "./StatusDropdown";
import { getLoggedInUser } from "@/data/users";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const AdminDashboard = async () => {
  // retrieve logged in user that's using the navbar
  const user = await getLoggedInUser();

  // retrieve admin's email
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  // return error page if user doesn't exist OR logged-in user is not allowed to view this page
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="mt-24 flex w-full justify-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-semibold">
            You are not allowed to view this page.
          </h3>
          <p>
            Click{" "}
            <Link
              href="/configure/upload"
              className="underline underline-offset-2 hover:text-primary"
            >
              here
            </Link>{" "}
            to create a custom phone case or return to the{" "}
            <Link
              href="/"
              className="underline underline-offset-2 hover:text-primary"
            >
              home
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    );
  }

  // retrieve all orders from the last week that have been successfully paid
  const orders = await db.order.findMany({
    where: {
      isPaid: true,
      createdAt: {
        // get the orders from the last week
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    // newest orders on top, oldest orders on the bottom
    orderBy: {
      createdAt: "desc",
    },
    // also fetch the related records of the retrieved order entries (SQL join syntax)
    include: {
      User: true,
      shippingAddress: true,
    },
  });

  // retrieve the sum of the revenue you made in the last week
  const lastWeekSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        // get the orders from the last week
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    // perform sum aggregation on the field 'amount' of the retrieved order entries
    _sum: {
      amount: true,
    },
  });

  // retrieve the sum of the revenue you made in the last month
  const lastMonthSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        // get the orders from the last month
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
    // perform sum aggregation on the field 'amount' of the retrieved order entries
    _sum: {
      amount: true,
    },
  });

  // revenue goals for your business
  const WEEKLY_GOAL = 500;
  const MONTHLY_GOAL = 2500;

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col sm:gap-4 sm:py-4">
        <div className="flex flex-col gap-16">
          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card weekly goal */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Last Week</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastWeekSum._sum.amount ?? 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  of {formatPrice(WEEKLY_GOAL)} goal
                </div>
              </CardContent>
              <CardFooter>
                {/* view progress of the weekly goal */}
                <Progress
                  // e.g. 500 * 100 = 50.000 - 50.000 / 500 = 100%
                  value={((lastWeekSum._sum.amount ?? 0) * 100) / WEEKLY_GOAL}
                />
              </CardFooter>
            </Card>

            {/* Card monhtly goal */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Last Month</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastMonthSum._sum.amount ?? 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  of {formatPrice(MONTHLY_GOAL)} goal
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  // e.g. 2500 * 100 = 250.000 - 250.000 / 2500 = 100%
                  value={((lastMonthSum._sum.amount ?? 0) * 100) / MONTHLY_GOAL}
                />
              </CardFooter>
            </Card>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Incoming orders</h1>

          {/* Table of all paid orders from last week */}
          <Table>
            {/* display column titles */}
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Purchased date
                </TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            {/* display all the retrieved orders in seperate rows */}
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="bg-accent">
                  <TableCell>
                    <div className="font-medium">
                      {order.shippingAddress?.name}
                    </div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {order.User.email}
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {/* display current order status and update order status */}
                    <StatusDropdown
                      orderId={order.id}
                      orderStatus={order.status}
                    />
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {order.createdAt.toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    {formatPrice(order.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
