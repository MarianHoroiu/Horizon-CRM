"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

/**
 * Auth provider component that wraps the application with the SessionProvider
 * from next-auth/react to provide authentication context
 */
export function AuthProvider({ children }: PropsWithChildren) {
  return <SessionProvider>{children}</SessionProvider>;
}
