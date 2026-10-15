import type { Metadata } from "next";
import { WalletScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "AI wallet" };

export default function Page() {
  return <WalletScreen />;
}
