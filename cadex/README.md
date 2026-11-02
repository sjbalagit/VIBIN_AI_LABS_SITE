# Cadex website

Upload this whole folder to your site, e.g. as yoursite.com/cadex/ (works on Netlify, Vercel, GitHub Pages, WordPress/cPanel file upload, etc.).

- index.html — the page
- privacy.html — the privacy policy
- cadex.css — all styles
- cadex.js — header, scroll reveal and the early-access form
- shots/ — product screenshots

Keep them all next to each other. Instrument Sans loads from Google Fonts.

## Early access (live)
The form runs on its own: email → "You're on the list" details → "Thanks!".
Sign-ups go to a Google Sheet through a small Apps Script, `apps-script/early-access.gs`. Each email gets one row: Signed up, Email, What does your work involve?, Province.

To connect it:
1. Open the sheet, then Extensions > Apps Script.
2. Replace the editor contents with `apps-script/early-access.gs` and save.
3. Choose `setup` in the function menu and click Run. Approve the permissions when asked. This also formats the sheet.
4. Deploy > New deployment > Web app. Set Execute as: Me, and Who has access: Anyone. Copy the Web app URL, which ends in /exec.
5. Set that URL in index.html:

       <div class="early" id="early" data-endpoint="https://script.google.com/macros/s/XXXX/exec">

After changing the script later, publish it with Deploy > Manage deployments > Edit > New version. This keeps the same URL.

Each step POSTs JSON as text/plain, because Apps Script can't answer the CORS preflight that application/json triggers:
- step 1: { step: "email", email }
- step 2 (Send): { step: "details", email, work: [...], province: [...], workOther?, provinceOther? }
  Skip sends nothing more (the email is already in).
The endpoint must answer with JSON containing `"ok": true`. If step 1 fails, the visitor sees an error and can retry. If step 2 fails, the visitor still sees "Thanks!" and the email stays recorded, without their answers. With no endpoint set, nothing is sent (a warning shows in the console).

## Before launch
- Set the effective date in privacy.html to the day this merges to main and goes live.
- Add a Terms page and footer link before the first customer signs up.
- The Pro plan is hidden; remove the `hidden` attribute on #plan-pro to show it.

## Linking from the other site
Link to the folder (e.g. /cadex/). To jump straight to the form, link to /cadex/#early.
