"use strict";

const fields = ["baseUrl", "apiKey", "model"];
const status = document.getElementById("status");
const testBtn = document.getElementById("test");
const testStatus = document.getElementById("test-status");

// Read the current field values into a settings object, filling blanks with defaults.
function valuesFromForm() {
  const values = {};
  for (const f of fields) values[f] = document.getElementById(f).value.trim();
  if (!values.baseUrl) values.baseUrl = DEFAULTS.baseUrl;
  if (!values.model) values.model = DEFAULTS.model;
  return values;
}

messenger.storage.local.get(DEFAULTS).then((saved) => {
  for (const f of fields) document.getElementById(f).value = saved[f];
});

document.getElementById("save").addEventListener("click", async () => {
  await messenger.storage.local.set(valuesFromForm());
  status.textContent = "Saved.";
  setTimeout(() => (status.textContent = ""), 2000);
});

testBtn.addEventListener("click", async () => {
  // Save the form first so chat() reads what the user typed, not stale storage.
  const values = valuesFromForm();
  await messenger.storage.local.set(values);
  testStatus.classList.remove("error");
  testStatus.textContent = "Contacting the model...";
  testBtn.disabled = true;
  try {
    const reply = await chat(
      "You are a connection test. Reply OK or anything short.",
      "Say OK."
    );
    testStatus.textContent = `Connected: ${reply.slice(0, 80)}`;
  } catch (e) {
    testStatus.textContent = e.message;
    testStatus.classList.add("error");
  } finally {
    testBtn.disabled = false;
  }
});
