import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { CreateInviteForm } from "@/components/studio/CreateInviteForm";

// Live form, never cached.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Skapa en inbjudan",
  description: "",
};

export default function PublicCreatePage() {
  return (
    <div className="relative">
      <SiteHeader />
      <main className="mx-auto max-w-content px-5 py-10 sm:py-14">
        <CreateInviteForm cancelHref="/" />
      </main>
      <SiteFooter />
    </div>
  );
}
