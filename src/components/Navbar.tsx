// navigate users to the specified routes without a full page reload
import Link from "next/link";
import React from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
// button variants from the component library
import { buttonVariants } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { getLoggedInUser } from "@/data/users";
import { UserButton } from "@clerk/nextjs";

const Navbar = async () => {
  // retrieve logged in user that's using the navbar
  const user = await getLoggedInUser();

  // variable that determines if current logged in user is an admin
  // check if current user's email (if 'user' is not null / logged in) is equal to the admin's email address saved inside the '.env' file
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  return (
    // Navigation Section
    <nav
      className="sticky inset-x-0 top-0 z-[100] h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all"
      aria-label="Primary site navigation"
    >
      <MaxWidthWrapper>
        <div className="border-zinc-20 flex h-14 items-center justify-between border-zinc-200">
          <Link href="/" className="z-40 flex font-semibold">
            Guard <span className="text-blue-600">Gear</span>
          </Link>
          <div className="flex h-full items-center space-x-6">
            {/* show links based on login status of the current user */}
            {user ? (
              <>
                {/* show link if current logged in user is an admin */}
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    Dashboard ✨
                  </Link>
                )}
                <Link
                  href="/configure/upload"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden items-center sm:flex",
                  })}
                >
                  Create case
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>

                <UserButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Sign up
                </Link>
                <Link
                  href="/sign-in"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Login
                </Link>

                <div className="sm:bloc hidden h-8 w-px bg-zinc-200" />

                <Link
                  href="/configure/upload"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden items-center sm:flex",
                  })}
                >
                  Create case
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
