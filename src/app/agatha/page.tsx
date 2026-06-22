import { NestLogin } from "@/features/nest/components/nest-login";
import { getCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function AgathaPage() {
  const session = await getCurrentSession();

  return <NestLogin hasSession={Boolean(session)} sessionName={session?.name} />;
}
