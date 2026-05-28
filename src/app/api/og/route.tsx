import { ImageResponse } from "next/og";
import { getTemplate } from "@/lib/templates";

export const runtime = "edge";

/**
 * Dynamic Open Graph image for invite link previews. Renders a branded,
 * template-tinted card so a shared link looks intentional — part of the
 * "who made this?" effect. /api/og?to=Sara&t=coffee
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = (searchParams.get("to") ?? "dig").slice(0, 40);
  const t = getTemplate(searchParams.get("t"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0d0c11",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "700px",
            height: "500px",
            background: `radial-gradient(circle at 70% 20%, ${t.from}55, transparent 60%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "600px",
            height: "400px",
            background: `radial-gradient(circle at 20% 80%, ${t.to}44, transparent 60%)`,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", color: "#a29cb0", fontSize: 30, letterSpacing: 2 }}>
          hejsöt
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#a29cb0", fontSize: 34, textTransform: "uppercase", letterSpacing: 6 }}>
            en inbjudan till
          </div>
          <div style={{ color: "#f4f2f9", fontSize: 120, fontWeight: 600, lineHeight: 1.05, marginTop: 12 }}>
            {to}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#f4f2f9",
            fontSize: 32,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
              display: "flex",
            }}
          />
          Någon vill träffa dig
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
