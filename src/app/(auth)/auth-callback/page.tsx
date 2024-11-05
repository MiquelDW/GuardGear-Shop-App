"use client";
// An "auth callback page" is a designated page that handles the response from an authentication provider, such as Clerk, after a user logs in or signs up.
// This response typically includes authentication tokens or error messages.
// An "auth callback page" is just a fancy name for a "redirect page" after user has logged in or signed up.

import { Loader2 } from "lucide-react";
// define a router obj to programmatically redirect users to the given route
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// this page searches for a phone case config ID and redirects the user to the "preview" route if a config ID is found.
const AuthCallback = () => {
  const router = useRouter();
  // state variable that stores the current configId from browser's local storage
  const [configId, setConfigId] = useState<string | null>(null);

  // on mount, retrieve and store current config ID from browser's local storage
  useEffect(() => {
    const configurationId = localStorage.getItem("configurationId");
    if (configurationId) setConfigId(configurationId);
  }, []);

  // if configId from browser's local storage has been found
  if (configId) {
    // remove the configId from local storage
    localStorage.removeItem("configurationId");
    // push the user back it's phone case configuration
    router.push(`/configure/preview?id=${configId}`);
  } else {
    // if NO configId from browser's local storage has been found
    router.push("/");
  }

  // return some user feedback while they're on the auth callback page
  return (
    <div className="mt-24 flex w-full justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <h3 className="text-xl font-semibold">Logging you in...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
