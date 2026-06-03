#!/usr/bin/env node
/**
 * Local dev: static site (grubshelf-site/) + POST /api/newsletter
 * Requires .env.local with BUTTONDOWN_API_KEY
 */
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

import newsletterHandler from "../api/newsletter.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = join(root, "grubshelf-site");
const port = Number(process.env.PORT) || 8080;

const envPath = join(root, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)$/);
    if (match) {
      process.env[match[1]] = match[2]
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

/** Vercel-style res.status().json() for Node http.ServerResponse */
function wrapResponse(res) {
  let statusCode = 200;
  const wrapped = {
    setHeader(name, value) {
      res.setHeader(name, value);
      return wrapped;
    },
    status(code) {
      statusCode = code;
      return wrapped;
    },
    json(body) {
      if (!res.writableEnded) {
        res.writeHead(statusCode, { "Content-Type": "application/json" });
        res.end(JSON.stringify(body));
      }
      return wrapped;
    },
  };
  return wrapped;
}

function serveStatic(pathname, res) {
  let filePath = join(siteRoot, pathname === "/" ? "index.html" : pathname);
  if (!filePath.startsWith(siteRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  res.end(readFileSync(filePath));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/api/newsletter") {
    try {
      req.body = await readRequestBody(req);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request body." }));
      return;
    }
    return newsletterHandler(req, wrapResponse(res));
  }

  serveStatic(pathname, res);
});

server.listen(port, "127.0.0.1", () => {
  const hasKey = Boolean(process.env.BUTTONDOWN_API_KEY);
  console.log(`grubshelf dev → http://127.0.0.1:${port}`);
  if (!hasKey) {
    console.warn(
      "Warning: BUTTONDOWN_API_KEY missing. Copy .env.example to .env.local and add your key.",
    );
  }
});
