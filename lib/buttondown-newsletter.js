import { readFileSync } from "fs";
import { join } from "path";

export const WELCOME_EMAIL_SUBJECT = "The list is still on your fridge";
export const WELCOME_EMAIL_RELATIVE_PATH = "emails/sample-first-issue.html";
export const BUTTONDOWN_API_BASE = "https://api.buttondown.com/v1";

const ALREADY_SUBSCRIBED_RE = /already subscribed/i;
const ALREADY_SUBSCRIBED_MESSAGE =
  "You're already on the list — welcome back.";

export function shouldSendWelcomeEmail(status, alreadySubscribed) {
  return (status === 200 || status === 201) && !alreadySubscribed;
}

export function buildSubscriberPayload(email, ipAddress) {
  return {
    email_address: email,
    type: "regular",
    ...(ipAddress ? { ip_address: ipAddress } : {}),
  };
}

let cachedWelcomeHtml = null;

export function loadWelcomeEmailHtml(
  readFile = readFileSync,
  cwd = process.cwd(),
) {
  if (cachedWelcomeHtml) return cachedWelcomeHtml;
  const path = join(cwd, WELCOME_EMAIL_RELATIVE_PATH);
  cachedWelcomeHtml = readFile(path, "utf8");
  return cachedWelcomeHtml;
}

export function resetWelcomeEmailHtmlCache() {
  cachedWelcomeHtml = null;
}

export async function sendWelcomeEmail(apiKey, email, html) {
  // Step 1: Create the email as a draft
  const createRes = await fetch(`${BUTTONDOWN_API_BASE}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: WELCOME_EMAIL_SUBJECT,
      body: html,
      status: "draft",
    }),
  });

  if (!createRes.ok) {
    const detail = await createRes.json().catch(() => null);
    return { ok: false, status: createRes.status, detail };
  }

  const draft = await createRes.json();

  // Step 2: Send the draft directly to this subscriber
  const sendRes = await fetch(
    `${BUTTONDOWN_API_BASE}/subscribers/${encodeURIComponent(email)}/emails/${draft.id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (sendRes.ok) {
    return { ok: true };
  }

  const detail = await sendRes.json().catch(() => null);
  return { ok: false, status: sendRes.status, detail };
}

function sanitizeUpstreamMessage(message) {
  if (ALREADY_SUBSCRIBED_RE.test(message)) {
    return ALREADY_SUBSCRIBED_MESSAGE;
  }
  return message;
}

function rawUpstreamMessage(detail) {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item != null && typeof item === "object" && "msg" in item) {
          const msg = item.msg;
          return typeof msg === "string" ? msg : null;
        }
        return null;
      })
      .filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" ");
    }
  }
  if (typeof detail === "object" && detail != null) {
    if (typeof detail.msg === "string") return detail.msg;
    if (typeof detail.message === "string") return detail.message;
  }
  return null;
}

export function isAlreadySubscribedUpstreamError(detail) {
  const message = rawUpstreamMessage(detail);
  return message != null && ALREADY_SUBSCRIBED_RE.test(message);
}

export function upstreamErrorToMessage(detail) {
  if (detail == null) {
    return "Something went wrong. Please try again.";
  }
  if (typeof detail === "string") {
    return sanitizeUpstreamMessage(detail);
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item != null && typeof item === "object" && "msg" in item) {
          const msg = item.msg;
          return typeof msg === "string" ? msg : null;
        }
        return null;
      })
      .filter(Boolean);
    if (parts.length > 0) {
      return sanitizeUpstreamMessage(parts.join(" "));
    }
  }
  if (typeof detail === "object") {
    if (typeof detail.msg === "string") {
      return sanitizeUpstreamMessage(detail.msg);
    }
    if (typeof detail.message === "string") {
      return sanitizeUpstreamMessage(detail.message);
    }
  }
  return "Something went wrong. Please try again.";
}
