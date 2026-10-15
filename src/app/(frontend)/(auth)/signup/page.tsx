import type { Metadata } from "next";
import { SignupScreen } from "@/components/auth/screens";

export const metadata: Metadata = { title: "Sign up" };

export default function Page() {
  return <SignupScreen />;
}
