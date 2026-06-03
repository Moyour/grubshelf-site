import { describe, expect, it, afterEach, vi } from "vitest";

import {
  WELCOME_EMAIL_SUBJECT,
  buildSubscriberPayload,
  isAlreadySubscribedUpstreamError,
  resetWelcomeEmailHtmlCache,
  sendWelcomeEmail,
  shouldSendWelcomeEmail,
  upstreamErrorToMessage,
} from "./buttondown-newsletter.js";

describe("shouldSendWelcomeEmail", () => {
  it("returns true for newly created subscribers (201)", () => {
    expect(shouldSendWelcomeEmail(201, false)).toBe(true);
  });

  it("returns true for overwritten subscribers (200)", () => {
    expect(shouldSendWelcomeEmail(200, false)).toBe(true);
  });

  it("returns false when already subscribed", () => {
    expect(shouldSendWelcomeEmail(201, true)).toBe(false);
    expect(shouldSendWelcomeEmail(200, true)).toBe(false);
    expect(shouldSendWelcomeEmail(409, true)).toBe(false);
  });
});

describe("buildSubscriberPayload", () => {
  it("includes email, type, and optional ip address", () => {
    expect(
      buildSubscriberPayload("you@example.com", "203.0.113.1"),
    ).toEqual({
      email_address: "you@example.com",
      type: "regular",
      ip_address: "203.0.113.1",
    });
  });

  it("omits ip address when not provided", () => {
    expect(buildSubscriberPayload("you@example.com")).toEqual({
      email_address: "you@example.com",
      type: "regular",
    });
  });
});

describe("sendWelcomeEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a draft then sends it to the subscriber", async () => {
    const mockFetch = vi.fn()
      // First call: create draft
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "email-123" }),
      })
      // Second call: send to subscriber
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
    vi.stubGlobal("fetch", mockFetch);

    const result = await sendWelcomeEmail("key", "test@example.com", "<p>Hi</p>");
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Verify draft was created with status "draft"
    const createCall = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(createCall.status).toBe("draft");
    expect(createCall.subject).toBe(WELCOME_EMAIL_SUBJECT);

    // Verify send call targets the subscriber
    expect(mockFetch.mock.calls[1][0]).toContain("subscribers/test%40example.com/emails/email-123");
  });

  it("returns failure when draft creation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Invalid body" }),
      }),
    );

    const result = await sendWelcomeEmail("key", "test@example.com", "<p>Hi</p>");
    expect(result).toEqual({
      ok: false,
      status: 400,
      detail: { detail: "Invalid body" },
    });
  });

  it("returns failure when send-to-subscriber fails", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "email-123" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: "Subscriber not found" }),
      });
    vi.stubGlobal("fetch", mockFetch);

    const result = await sendWelcomeEmail("key", "test@example.com", "<p>Hi</p>");
    expect(result).toEqual({
      ok: false,
      status: 404,
      detail: { detail: "Subscriber not found" },
    });
  });
});

describe("upstreamErrorToMessage", () => {
  it("returns plain strings", () => {
    expect(upstreamErrorToMessage("Email invalid")).toBe("Email invalid");
  });

  it("joins msg from validation-style objects", () => {
    expect(
      upstreamErrorToMessage([
        { type: "value_error", loc: ["body", "email"], msg: "Invalid email" },
      ]),
    ).toBe("Invalid email");
  });

  it("shortens duplicate subscriber errors", () => {
    const raw =
      "That email address (you@example.com) is already subscribed (id=abc).";
    expect(upstreamErrorToMessage(raw)).toBe(
      "You're already on the list — welcome back.",
    );
    expect(isAlreadySubscribedUpstreamError(raw)).toBe(true);
  });

  it("falls back when detail is unusable", () => {
    expect(upstreamErrorToMessage(null)).toBe(
      "Something went wrong. Please try again.",
    );
  });
});

describe("constants", () => {
  afterEach(() => {
    resetWelcomeEmailHtmlCache();
  });

  it("uses the welcome issue subject line", () => {
    expect(WELCOME_EMAIL_SUBJECT).toBe("The list is still on your fridge");
  });
});
