import { StudioHeader } from "@/components/studio/StudioHeader";
import { CreateInviteForm } from "@/components/studio/CreateInviteForm";

export default function NewInvitePage() {
  return (
    <>
      <StudioHeader showNew={false} />
      <main className="mx-auto max-w-content px-5 py-8">
        <h1 className="font-display text-3xl font-medium text-fg">Ny inbjudan</h1>
        <p className="mt-1 text-[14px] text-muted">Välj en stämning, gör den personlig, dela länken.</p>
        <div className="mt-8">
          <CreateInviteForm />
        </div>
      </main>
    </>
  );
}
