"use strict";

const reviewBtn = document.getElementById("review");
const improveBtn = document.getElementById("improve");
const applyBtn = document.getElementById("apply");
const status = document.getElementById("status");
const output = document.getElementById("output");
const buttons = [reviewBtn, improveBtn, applyBtn];

async function draft() {
  const tab = await activeTab();
  const details = await messenger.compose.getComposeDetails(tab.id);
  const body = details.isPlainText ? details.plainTextBody : htmlToText(details.body);
  return { tab, details, body };
}

onAction(reviewBtn, status, output, buttons, async () => {
  const { details, body } = await draft();
  const result = await chat(
    "You review email drafts before they are sent. Point out problems concretely and briefly: tone, clarity, typos, missing recipients or attachments the text mentions, unanswered questions. Use short bullets. If the draft is fine, say so in one line.",
    `Subject: ${details.subject}\nTo: ${details.to.join(", ")}\n\n${body}`
  );
  output.textContent = result;
  output.hidden = false;
  applyBtn.hidden = true;
});

onAction(improveBtn, status, output, buttons, async () => {
  const { details, body } = await draft();
  const result = await chat(
    "Rewrite the email body to be clear, well-toned, and typo-free while keeping the sender's voice, intent, and language. Return only the rewritten body, no commentary, no subject line.",
    `Subject: ${details.subject}\n\n${body}`
  );
  output.textContent = result;
  output.hidden = false;
  applyBtn.hidden = false;
});

onAction(applyBtn, status, output, buttons, async () => {
  const { tab, details } = await draft();
  const text = output.textContent;
  if (details.isPlainText) {
    await messenger.compose.setComposeDetails(tab.id, { plainTextBody: text });
  } else {
    const html = text
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
      .join("");
    await messenger.compose.setComposeDetails(tab.id, { body: html });
  }
  applyBtn.hidden = true;
  window.close();
});
