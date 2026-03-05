import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import QrCodeGenerator from "@/components/QrCodeGenerator";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <QrCodeGenerator />;
}
