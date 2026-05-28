import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInvitation } from "@/lib/queries";
import { getTemplate } from "@/lib/templates";
import { InviteExperience } from "@/components/invite/InviteExperience";

// Invites are live, personal and uncacheable.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const invite = await getPublicInvitation(slug);
  if (!invite) return { title: "Inbjudan" };
  const t = getTemplate(invite.template);
  const og = `/api/og?to=${encodeURIComponent(invite.recipientName)}&t=${t.id}`;
  const title = `En inbjudan till ${invite.recipientName}`;
  return {
    title,
    description: invite.headline,
    robots: { index: false, follow: false }, // personal links shouldn't be indexed
    openGraph: {
      title,
      description: invite.headline,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, images: [og] },
  };
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;
  const invite = await getPublicInvitation(slug);
  if (!invite) notFound();
  return <InviteExperience invitation={invite} />;
}
