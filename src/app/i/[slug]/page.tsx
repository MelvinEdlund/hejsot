import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInvitation } from "@/lib/queries";
import { isInvitationUnlocked } from "@/lib/queries";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { LockedInvitePage } from "@/components/invite/LockedInvitePage";

// Invites are live, personal and uncacheable.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Peek at DB directly (no is_unlocked gate) just for metadata
  const { data } = await supabaseAdmin()
    .from("invitations")
    .select("recipient_name, headline, template")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Inbjudan" };
  const t = getTemplate((data.template as string | null) ?? "custom");
  const og = `/api/og?to=${encodeURIComponent(data.recipient_name as string)}&t=${t.id}`;
  const title = `En inbjudan till ${data.recipient_name}`;
  return {
    title,
    description: data.headline as string,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: data.headline as string,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, images: [og] },
  };
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;

  // Check if the invite exists and whether it is unlocked
  const unlocked = await isInvitationUnlocked(slug);

  if (!unlocked) {
    // Show locked placeholder — paywall was not completed
    return <LockedInvitePage slug={slug} />;
  }

  // getPublicInvitation also gates on is_unlocked, archived and expiry
  const invite = await getPublicInvitation(slug);
  if (!invite) notFound();

  return <InviteExperience invitation={invite} />;
}
