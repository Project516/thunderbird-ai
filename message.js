"use strict";

const summarizeBtn = document.getElementById("summarize");
const replyBtn = document.getElementById("reply");
const status = document.getElementById("status");
const output = document.getElementById("output");
const buttons = [summarizeBtn, replyBtn];

async function displayedMessage() {
  const tab = await activeTab();
  const msg = await messenger.messageDisplay.getDisplayedMessage(tab.id);
  if (!msg) throw new Error("No message is displayed.");
  const full = await messenger.messages.getFull(msg.id);
  const body = messageText(full);
  if (!body) throw new Error("Could not extract text from this message.");
  return { msg, body };
}

onAction(summarizeBtn, status, output, buttons, async () => {
  const { msg, body } = await displayedMessage();
  const result = await chat(
    "Summarize emails. Give a few short bullets: key points, requests directed at the reader, dates or deadlines. No preamble.",
    `From: ${msg.author}\nSubject: ${msg.subject}\n\n${body}`
  );
  output.textContent = result;
  output.hidden = false;
  await messenger.storage.local.set({
    lastSummary: { key: msg.headerMessageId, text: result },
  });
});

// The popup is torn down on every close; bring back the summary if the
// displayed message is still the one we last summarized.
(async () => {
  try {
    const tab = await activeTab();
    const msg = await messenger.messageDisplay.getDisplayedMessage(tab.id);
    if (!msg) return;
    const { lastSummary } = await messenger.storage.local.get("lastSummary");
    if (lastSummary && lastSummary.key === msg.headerMessageId) {
      output.textContent = lastSummary.text;
      output.hidden = false;
    }
  } catch (e) {
    status.textContent = e.message;
    status.classList.add("error");
  }
})();

onAction(replyBtn, status, output, buttons, async () => {
  const { msg, body } = await displayedMessage();
  const result = await chat(
    "Draft a brief, polite reply to the email, in the email's language. Return only the reply body, no subject line, no commentary. Leave [brackets] where only the sender knows the answer.",
    `From: ${msg.author}\nSubject: ${msg.subject}\n\n${body}`
  );
  await messenger.compose.beginReply(msg.id, "replyToSender", {
    plainTextBody: result,
    isPlainText: true,
  });
  window.close();
});
