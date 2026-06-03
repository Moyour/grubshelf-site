import {
  BUTTONDOWN_API_BASE,
  buildSubscriberPayload,
  isAlreadySubscribedUpstreamError,
  loadWelcomeEmailHtml,
  sendWelcomeEmail,
  shouldSendWelcomeEmail,
  upstreamErrorToMessage,
} from "../lib/buttondown-newsletter.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return value.split(",")[0]?.trim();
  }
  const realIp = req.headers["x-real-ip"];
  return typeof realIp === "string" ? realIp : undefined;
}

async function parseJsonBody(req) {
  if (req.body != null && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.length > 0) {
    return JSON.parse(req.body);
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let body;
  try {
    body = await parseJsonBody(req);
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error:
        "Newsletter service is not configured yet. Please try again later.",
    });
  }

  const welcomeToken = crypto.randomUUID();

  try {
    const subscribeRes = await fetch(`${BUTTONDOWN_API_BASE}/subscribers`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildSubscriberPayload(email, welcomeToken, clientIp(req)),
      ),
    });

    const data = await subscribeRes.json().catch(() => null);
    const rawDetail = data?.detail ?? data?.error;
    const alreadySubscribed =
      subscribeRes.status === 409 ||
      isAlreadySubscribedUpstreamError(rawDetail);

    if (subscribeRes.ok || alreadySubscribed) {
      if (shouldSendWelcomeEmail(subscribeRes.status, alreadySubscribed)) {
        try {
          const welcomeResult = await sendWelcomeEmail(
            apiKey,
            welcomeToken,
            loadWelcomeEmailHtml(),
          );
          if (!welcomeResult.ok) {
            console.error("[newsletter] welcome email failed:", {
              status: welcomeResult.status,
              detail: welcomeResult.detail,
              email,
            });
          }
        } catch (err) {
          console.error("[newsletter] welcome email error:", err);
        }
      }

      return res.status(200).json({
        ok: true,
        ...(alreadySubscribed ? { alreadySubscribed: true } : {}),
      });
    }

    return res
      .status(subscribeRes.status)
      .json({ error: upstreamErrorToMessage(rawDetail) });
  } catch {
    return res.status(502).json({
      error: "Could not reach the newsletter service. Please try again.",
    });
  }
}
