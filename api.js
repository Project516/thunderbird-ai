"use strict";

const DEFAULTS = {
  baseUrl: "https://openrouter.ai/api/v1",
  apiKey: "",
  model: "openrouter/free",
};

// Rough cap so huge emails don't blow the model's context window.
const MAX_CHARS = 12000;

async function getSettings() {
  return messenger.storage.local.get(DEFAULTS);
}

async function chat(system, user) {
  const { baseUrl, apiKey, model } = await getSettings();
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  let res;
  try {
    res = await fetch(baseUrl.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user.slice(0, MAX_CHARS) },
        ],
      }),
    });
  } catch (e) {
    throw new Error(`Could not reach ${baseUrl}. Check the endpoint in the add-on settings. (${e.message})`);
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    if (res.status === 401 || res.status === 403) {
      throw new Error("The API rejected your key. Check it in the add-on settings.");
    }
    throw new Error(`API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("The API returned no text.");
  return text.trim();
}

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, script, head").forEach((n) => n.remove());
  doc.querySelectorAll("br, p, div, li, tr, blockquote").forEach((n) => n.append("\n"));
  return doc.body.textContent.replace(/\n{3,}/g, "\n\n").trim();
}

// Depth-first search of a MIME tree from messages.getFull(); prefers text/plain.
function partText(part, wantType) {
  if (part.contentType && part.contentType.startsWith(wantType) && part.body) {
    return part.body;
  }
  for (const p of part.parts || []) {
    const t = partText(p, wantType);
    if (t) return t;
  }
  return "";
}

function messageText(fullPart) {
  const plain = partText(fullPart, "text/plain");
  if (plain) return plain;
  const html = partText(fullPart, "text/html");
  return html ? htmlToText(html) : "";
}

async function activeTab() {
  const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Wire a popup: run task() on click, manage busy/error/output states.
function onAction(button, statusEl, outputEl, buttons, task) {
  button.addEventListener("click", async () => {
    buttons.forEach((b) => (b.disabled = true));
    statusEl.textContent = "Thinking…";
    statusEl.classList.remove("error");
    outputEl.hidden = true;
    try {
      await task();
      statusEl.textContent = "";
    } catch (e) {
      statusEl.textContent = e.message;
      statusEl.classList.add("error");
    } finally {
      buttons.forEach((b) => (b.disabled = false));
    }
  });
}

// Validate an OpenAI-compatible endpoint URL the user typed into Settings.
// Rejects the common mistake the README calls out: a bare host with no scheme,
// which fetch() would reject with a confusing "Could not reach" error at chat
// time. Returns a human-readable reason, or "" when the URL looks usable.
function baseUrlProblem(baseUrl) {
  const url = (baseUrl || "").trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    return "Endpoint must start with http:// or https://";
  }
  try {
    new URL(url);
  } catch (e) {
    return "Endpoint is not a valid URL.";
  }
  return "";
}

// Expose the pure helpers for the Node test runner. `module` is undefined in a
// Thunderbird popup, so this guard never runs there.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { partText, messageText, htmlToText, baseUrlProblem };
}
