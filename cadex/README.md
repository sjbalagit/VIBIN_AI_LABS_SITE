# Cadex website

Upload this whole folder to your site, e.g. as yoursite.com/cadex/ (works on Netlify, Vercel, GitHub Pages, WordPress/cPanel file upload, etc.).

- index.html — the page
- cadex.css — all styles
- cadex.js — header, scroll reveal and the early-access form
- shots/ — product screenshots

Keep all four next to each other. Instrument Sans loads from Google Fonts.

## Early access (live)
The form runs on its own: email → "You're on the list" details → "Thanks!".
To receive sign-ups, set your form service URL in index.html:

    <div class="early" id="early" data-endpoint="https://formspree.io/f/XXXX">

Each step POSTs JSON:
- step 1: { step: "email", email }
- step 2 (Send): { step: "details", email, work: [...], province: [...], workOther?, provinceOther? }
  Skip sends nothing more (the email is already in).
If step 1 fails, the visitor sees an error and can retry. With no endpoint set, nothing is sent (a warning shows in the console).

## Before launch
- Footer Privacy and Terms links point to #pricing — replace with real pages.
- The Pro plan is hidden; remove the `hidden` attribute on #plan-pro to show it.

## Linking from the other site
Link to the folder (e.g. /cadex/). To jump straight to the form, link to /cadex/#early.
