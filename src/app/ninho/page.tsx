import { redirect } from "next/navigation";
import { NestRoom } from "@/features/nest/components/nest-room";
import { getCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function NinhoPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return <NestRoom role={session.role} name={session.name} />;
}
