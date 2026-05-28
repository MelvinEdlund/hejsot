import { listInvitations } from "@/lib/queries";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { InviteTable } from "@/components/studio/InviteTable";

export default async function StudioDashboard() {
  const invitations = await listInvitations();

  const total = invitations.length;
  const viewed = invitations.filter((i) => i.openCount > 0).length;
  const responded = invitations.filter((i) => (i.responseCount ?? 0) > 0).length;
  const rate = total ? Math.round((responded / total) * 100) : 0;

  const stats = [
    { label: "Inbjudningar", value: total },
    { label: "Sedda", value: viewed },
    { label: "Svarade", value: responded },
    { label: "Svarsfrekvens", value: `${rate}%` },
  ];

  return (
    <>
      <StudioHeader />
      <main className="mx-auto max-w-content px-5 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-medium text-fg">Översikt</h1>
            <p className="mt-1 text-[14px] text-muted">Alla dina inbjudningar på ett ställe.</p>
          </div>
        </div>

        {/* Analytics */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/10 bg-surface/50 p-5">
              <div className="font-display text-3xl text-fg">{s.value}</div>
              <div className="mt-1 text-[13px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="mt-8">
          <InviteTable invitations={invitations} />
        </div>
      </main>
    </>
  );
}
