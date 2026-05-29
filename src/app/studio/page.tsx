import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/user-session";
import { listUserInvitations, getInvitationDetail } from "@/lib/queries";
import { UserDashboard } from "@/components/studio/UserDashboard";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const session = await getUserSession();
  if (!session) redirect("/login?redirect=/studio");

  const invitations = await listUserInvitations(session.sub);

  // Fetch responses for each invite (parallel)
  const details = await Promise.all(
    invitations.map((inv) => getInvitationDetail(inv.id)),
  );

  const withResponses = invitations.map((inv, i) => ({
    invitation: inv,
    responses: details[i]?.responses ?? [],
  }));

  return (
    <UserDashboard
      email={session.email}
      invitations={withResponses}
    />
  );
}
