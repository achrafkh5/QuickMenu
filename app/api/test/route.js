export async function GET(req) {
  let ip =
    req.headers.get("x-forwarded-for") || // real client IP on Vercel / proxy
    req.ip ||                             // fallback
    "unknown";

  // If it's IPv6 loopback, map it to IPv4
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  // If multiple IPs are forwarded, take the first one
  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  return Response.json({ ip });
}