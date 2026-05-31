"use client";

import { motion } from "framer-motion";
import { Lock, Heart } from "lucide-react";

/**
 * Shown when someone navigates to /i/[slug] before the creator has paid.
 * Keeps it minimal — we don't want to spoil the invite or look broken.
 */
export function LockedInvitePage({ slug }: { slug: string }) {
  void slug; // available for future "notify me" features
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-5 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-surface"
      >
        <Lock className="h-7 w-7 text-muted/60" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6 font-display text-2xl font-medium text-fg"
      >
        den här inbjudan är snart redo
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted"
      >
        skaparen håller på att förbereda något fint åt dig.
        kom tillbaka om en liten stund.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-10 flex items-center gap-1.5 text-[13px] text-muted/50"
      >
        <Heart className="h-3 w-3 fill-current" strokeWidth={0} />
        <span className="font-display italic">hejsöt</span>
      </motion.div>
    </div>
  );
}
