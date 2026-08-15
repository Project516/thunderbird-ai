"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  partText,
  messageText,
  htmlToText,
  baseUrlProblem,
} = require("../api.js");

function part(type, body, parts) {
  const p = { contentType: type };
  if (body !== undefined) p.body = body;
  if (parts) p.parts = parts;
  return p;
}

describe("partText", () => {
  it("returns the body of a matching top-level part", () => {
    assert.equal(partText(part("text/plain", "hello"), "text/plain"), "hello");
  });

  it("matches by contentType prefix", () => {
    assert.equal(
      partText(part("text/html; charset=utf-8", "<b>hi</b>"), "text/html"),
      "<b>hi</b>"
    );
  });

  it("returns empty string when nothing matches", () => {
    assert.equal(partText(part("image/png", "binary"), "text/plain"), "");
  });

  it("walks nested parts and returns the first match", () => {
    const tree = part("multipart/mixed", undefined, [
      part("text/html", "<p>no</p>"),
      part("multipart/alternative", undefined, [
        part("text/plain", "yes"),
        part("text/plain", "also"),
      ]),
    ]);
    assert.equal(partText(tree, "text/plain"), "yes");
  });

  it("handles a missing parts array", () => {
    assert.equal(partText(part("text/plain", "x"), "text/html"), "");
  });

  it("ignores a matching contentType that has no body", () => {
    const tree = part("multipart/alternative", undefined, [
      part("text/plain", undefined),
      part("text/plain", "fallback"),
    ]);
    assert.equal(partText(tree, "text/plain"), "fallback");
  });
});

describe("messageText", () => {
  it("prefers text/plain over text/html", () => {
    const full = part("multipart/alternative", undefined, [
      part("text/html", "<p>html body</p>"),
      part("text/plain", "plain body"),
    ]);
    // plain wins, so DOMParser (htmlToText) is never touched.
    assert.equal(messageText(full), "plain body");
  });

  it("returns empty string when no usable part exists", () => {
    assert.equal(messageText(part("image/png", "binary")), "");
  });

  it("returns the plain body of a simple single-part message", () => {
    assert.equal(messageText(part("text/plain", "just text")), "just text");
  });
});

describe("baseUrlProblem", () => {
  it("accepts a well-formed https endpoint", () => {
    assert.equal(
      baseUrlProblem("https://openrouter.ai/api/v1"),
      ""
    );
  });

  it("accepts a well-formed http (local) endpoint", () => {
    assert.equal(baseUrlProblem("http://localhost:11434/v1"), "");
  });

  it("accepts the empty string (falls back to the default later)", () => {
    assert.equal(baseUrlProblem(""), "");
  });

  it("rejects a bare host with no scheme", () => {
    assert.match(
      baseUrlProblem("openrouter.ai/api/v1"),
      /http:\/\//i
    );
  });

  it("rejects a ftp:// scheme", () => {
    assert.match(
      baseUrlProblem("ftp://localhost:11434/v1"),
      /http/i
    );
  });

  it("rejects a malformed URL", () => {
    assert.match(baseUrlProblem("https://not a url"), /valid URL/i);
  });
});

// htmlToText depends on DOMParser, which is not present in the Node runtime
// that powers this suite. The test documents the expected behaviour and runs
// only inside a DOM-capable environment (e.g. a headless browser).
const hasDOM = typeof globalThis.DOMParser !== "undefined";
const maybe = hasDOM ? it : it.skip;

describe("htmlToText", () => {
  maybe("strips style/script/head and collapses blank lines", () => {
    const html =
      "<html><head><style>a{}</style></head>" +
      "<body><p>one</p><script>x</script><p>two</p></body>";
    const out = htmlToText(html);
    assert.match(out, /one/);
    assert.match(out, /two/);
    assert.doesNotMatch(out, /x/);
    assert.doesNotMatch(out, /style|script|head/i);
  });
});
