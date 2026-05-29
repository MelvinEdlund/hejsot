import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { CreateInviteForm } from "@/components/studio/CreateInviteForm";

export default async function NewInvitePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/studio/login");

  return (
    <>
      <StudioHeader showNew={false} />
      <main className="mx-auto max-w-content px-5 py-8">
        <h1 className="font-display text-3xl font-medium text-fg">Ny inbjudan</h1>
        <p className="mt-1 text-[14px] text-muted">Valj en stamning, gor den personlig, dela lanken.</p>
        <div className="mt-8">
          <CreateInviteForm />
        </div>
      </main>
    </>
  );
}
