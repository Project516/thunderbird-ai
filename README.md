# Mail AI Assistant

A Thunderbird extension that adds AI help to email. It puts two buttons in your mail client:

- "AI review" in the compose window checks a draft for tone, typos, and attachments you mentioned but forgot to attach. It can also suggest a rewrite, which you can apply to the draft with one click.
- "AI summarize" in the message view summarizes the open message, or drafts a reply in a new compose window.

It talks to any OpenAI-compatible API. The default is OpenRouter, where you bring your own key. The default model, `openrouter/free`, auto-routes to a free model, so a free OpenRouter account is enough. To keep everything local instead, run Ollama or llama.cpp's `llama-server` and point the endpoint at `http://localhost:11434/v1` or `http://localhost:8080/v1`. Local servers need no key.

## Install

Download the .xpi from the [releases page](https://github.com/Project516/thunderbird-ai/releases), then install it in Thunderbird from the Add-ons Manager gear menu ("Install Add-on From File"). Thunderbird installs unsigned add-ons, so no signing step is needed. After installing, open the add-on's Preferences tab and set the endpoint, key, and model.

To hack on it instead, open Tools > Developer Tools > Debug Add-ons, click "Load Temporary Add-on", and pick `manifest.json`. Temporary add-ons unload when Thunderbird closes. Build the .xpi with `./build.sh`.

If Thunderbird is installed as a flatpak, grant it read access to your checkout first, then restart it:

    flatpak override --user --filesystem=$PWD:ro org.mozilla.thunderbird_esr

Without this the sandbox cannot read the extension files, which shows up as blank pages and stale code after edits.

## Checking it works

- Write a draft with a typo and the words "see attached", but no attachment. AI review should flag both.
- Open any message and click Summarize. You should get a few bullets. Draft reply should open a reply window with a usable body.
- Put a wrong API key in the settings. The popup should show a readable error instead of hanging. You can also click "Test connection" on the settings page to check your endpoint, key, and model before opening any email.

## Privacy

Email content goes to whichever endpoint you configure, and only when you click a button. Nothing runs in the background. The API key is stored unencrypted in your Thunderbird profile.

## License

AGPL-3.0-or-later. See LICENSE.
