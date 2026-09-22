export type RiskAssessment = {
  score: number; // 0 (clean) to 100 (high risk)
  level: "clean" | "low" | "medium" | "high";
  flags: string[];
  isVpnOrProxy: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  clientIp: string;
};

// Known suspicious IP ranges, public cloud hosting ASNs / subnets (Tor, AWS, GCP, DigitalOcean, Cloudflare, proxies)
const SUSPICIOUS_SUBNETS = [
  "104.28.", "104.29.", "198.41.", // Cloudflare WARP / proxy ranges
  "185.220.", "185.100.", "199.249.", // Known exit nodes
  "51.15.", "163.172.", "62.210.", // Scaleway / VPS
  "149.202.", "51.254.", "51.255.", // OVH public VPS
];

export function assessRisk(headers: Headers, email?: string): RiskAssessment {
  const flags: string[] = [];
  let score = 0;

  // Extract real client IP through common reverse proxy headers
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip");
  const clientIp = (cfConnectingIp || realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1")).trim();

  // Check for proxy-specific headers
  const via = headers.get("via");
  if (via) {
    flags.push("HTTP_VIA_PROXY");
    score += 25;
  }

  const xProxyId = headers.get("x-proxy-id") || headers.get("x-tor-exit");
  if (xProxyId) {
    flags.push("TOR_OR_ANON_PROXY");
    score += 45;
  }

  // Check IP prefixes against datacenter / proxy ranges
  let isVpnOrProxy = false;
  let isTor = false;
  let isDatacenter = false;

  for (const subnet of SUSPICIOUS_SUBNETS) {
    if (clientIp.startsWith(subnet)) {
      flags.push(`DATACENTER_PROXY_RANGE_${subnet}`);
      score += 35;
      isVpnOrProxy = true;
      isDatacenter = true;
      break;
    }
  }

  // User-Agent inspection
  const ua = (headers.get("user-agent") || "").toLowerCase();
  if (!ua || ua.length < 15) {
    flags.push("EMPTY_OR_ANOMALOUS_USER_AGENT");
    score += 30;
  } else if (ua.includes("curl") || ua.includes("python") || ua.includes("postman") || ua.includes("bot") || ua.includes("headless")) {
    flags.push("AUTOMATED_CLIENT_OR_SCRIPTER");
    score += 40;
  }

  // Disposable temporary email check
  if (email) {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const disposableDomains = [
      "tempmail.com", "10minutemail.com", "guerrillamail.com", "throwawaymail.com",
      "sharklasers.com", "mailinator.com", "yopmail.com", "trashmail.com", "generator.email"
    ];
    if (disposableDomains.some((d) => domain.includes(d))) {
      flags.push("DISPOSABLE_TEMP_EMAIL");
      score += 35;
    }
  }

  // Cap score at 100
  score = Math.min(100, score);

  let level: RiskAssessment["level"] = "clean";
  if (score >= 60) level = "high";
  else if (score >= 35) level = "medium";
  else if (score >= 15) level = "low";

  return {
    score,
    level,
    flags,
    isVpnOrProxy,
    isTor,
    isDatacenter,
    clientIp,
  };
}
