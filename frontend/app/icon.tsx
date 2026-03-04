export const runtime = 'edge';

export default function Icon() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill="#6366f1"/>
      <text x="16" y="23" text-anchor="middle" font-size="20" fill="white" font-family="sans-serif">A</text>
    </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
}
