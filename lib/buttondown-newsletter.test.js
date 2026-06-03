import { describe, expect, it, afterEach, vi } from "vitest";

import {
  WELCOME_EMAIL_SUBJECT,
  buildSubscriberPayload,
  buildWelcomeEmailFilters,
  isAlreadySubscribedUpstreamError,
  resetWelcomeEmailHtmlCache,
  sendWelcomeEmail,
  shouldSendWelcomeEmail,
  upstreamErrorToMessage,
} from "./buttondown-newsletter.js";

describe("buildWelcomeEmailFilters", () => {
  it("targets a single subscriber by welcome_token metadata", () => {
    expect(buildWelcomeEmailFilters("abc-123")).toEqual({
      predicate: "and",
      filters: [
        {
          field: "subscriber.metadata.welcome_token",
          operator: "equals",
          value: "abc-123",
        },
      ],
      groups: [],
    });
  });
});

describe("shouldSendWelcomeEmail", () => {
  it("returns true only for newly created subscribers", () => {
    expect(shouldSendWelcomeEmail(201, false)).toBe(true);
    expect(shouldSendWelcomeEmail(200, false)).toBe(false);
    expect(shouldSendWelcomeEmail(201, true)).toBe(false);
    expect(shouldSendWelcomeEmail(409, true)).toBe(false);
  });
});

describe("buildSubscriberPayload", () => {
  it("includes welcome_token metadata and optional ip address", () => {
    expect(
      buildSubscriberPayload("you@example.com", "token-1", "203.0.113.1"),
    ).toEqual({
      email_address: "you@example.com",
      type: "regular",
      metadata: { welcome_token: "token-1" },
      ip_address: "203.0.113.1",
    });
  });

  it("omits ip address when not provided", () => {
    expect(buildSubscriberPayload("you@example.com", "token-1")).toEqual({
      email_address: "you@example.com",
      type: "regular",
      metadata: { welcome_token: "token-1" },
    });
  });
});

describe("sendWelcomeEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok when Buttondown accepts the send request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );

    const result = await sendWelcomeEmail("key", "token-1", "<p>Hi</p>");
    expect(result).toEqual({ ok: true });
  });

  it("returns failure details when Buttondown rejects the send request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Invalid filters" }),
      }),
    );

    const result = await sendWelcomeEmail("key", "token-1", "<p>Hi</p>");
    expect(result).toEqual({
      ok: false,
      status: 400,
      detail: { detail: "Invalid filters" },
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
