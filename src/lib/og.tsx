/** Shared pieces for generated preview images (next/og). */

/** Manrope (the site font) from Google Fonts, fetched at build/render time. */
async function manrope(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Manrope:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Fonts for ImageResponse; empty when offline (ImageResponse then uses its built-in font). */
export async function brandFonts() {
  // Downloaded once per build/instance (around a hundred cards are drawn at deploy); retried if it failed.
  fontsLoaded ??= loadFonts().then((f) => (f.length ? f : ((fontsLoaded = null), f)));
  return fontsLoaded;
}

type Font = { name: string; data: ArrayBuffer; weight: 500 | 800; style: "normal" };
let fontsLoaded: Promise<Font[]> | null = null;

async function loadFonts(): Promise<Font[]> {
  const [bold, medium] = await Promise.all([manrope(800), manrope(500)]);
  return [
    ...(bold ? [{ name: "Manrope", data: bold, weight: 800 as const, style: "normal" as const }] : []),
    ...(medium ? [{ name: "Manrope", data: medium, weight: 500 as const, style: "normal" as const }] : []),
  ];
}

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_BACKGROUND = {
  backgroundColor: "#0d0d14",
  backgroundImage: "radial-gradient(circle at 12% 8%, rgba(127,119,221,0.42), rgba(13,13,20,0) 48%), radial-gradient(circle at 92% 96%, rgba(93,202,165,0.3), rgba(13,13,20,0) 46%)",
};

/** The Throvic mark + wordmark. */
export function OgBrand({ size = 52 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8a82e6" />
            <stop offset="1" stopColor="#4fbf9a" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#g)" />
        <path d="M8.5 10.5h15M16 10.5v12" stroke="#fff" strokeOpacity=".7" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="8.5" cy="10.5" r="2.3" fill="#fff" />
        <circle cx="23.5" cy="10.5" r="2.3" fill="#fff" />
        <circle cx="16" cy="10.5" r="3.1" fill="#fff" />
        <circle cx="16" cy="23" r="2.7" fill="#fff" />
      </svg>
      <div style={{ display: "flex", fontSize: size * 0.72, fontWeight: 800, color: "#e8e6f0" }}>
        <span>Thro</span>
        <span style={{ color: "#6fb8b4" }}>vic</span>
      </div>
    </div>
  );
}
