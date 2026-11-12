// Withdraw the report and every previous download URL.
export function GET() {
  return new Response("This report has been withdrawn.\n", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const HEAD = GET;
