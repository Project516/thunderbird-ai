"use strict";

const fields = ["baseUrl", "apiKey", "model"];
const status = document.getElementById("status");

messenger.storage.local.get(DEFAULTS).then((saved) => {
  for (const f of fields) document.getElementById(f).value = saved[f];
});

document.getElementById("save").addEventListener("click", async () => {
  const values = {};
  for (const f of fields) values[f] = document.getElementById(f).value.trim();

  const problem = baseUrlProblem(values.baseUrl);
  if (problem) {
    status.textContent = problem;
    status.classList.add("error");
    return;
  }

  if (!values.baseUrl) values.baseUrl = DEFAULTS.baseUrl;
  if (!values.model) values.model = DEFAULTS.model;
  await messenger.storage.local.set(values);
  status.textContent = "Saved.";
  status.classList.remove("error");
  setTimeout(() => (status.textContent = ""), 2000);
});
