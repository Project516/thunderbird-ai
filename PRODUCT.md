# Product

## Register

product

## Users

Thunderbird users reading and writing email. They are mid-task (composing or triaging); the assistant is a sidekick, never the main event.

## Product Purpose

A MailExtension that adds AI help to email: review a draft before sending, rewrite it on request, summarize a received message, draft a reply. Works with any OpenAI-compatible endpoint: OpenRouter with the user's own key by default, or a local model through Ollama or a llama.cpp server.

## Brand Personality

Quiet, trustworthy, native-feeling. It should look like it shipped with Thunderbird.

## Anti-references

Flashy "AI product" chrome: gradients, sparkles emoji-style iconography, chat bubbles, purple-on-white AI branding. No decorative motion.

## Design Principles

- Disappear into the task: popups answer one question and get out of the way.
- Nothing automatic: the model is only called when the user clicks.
- Every state exists: loading, error (bad key, no server), empty settings.

## Accessibility & Inclusion

WCAG AA. Keyboard operable, visible focus, 4.5:1 body contrast, reduced-motion respected, works in light and dark.
