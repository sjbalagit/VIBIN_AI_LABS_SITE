# VIBIN_AI_LABS_SITE

The VIBIN AI LABS website, published with GitHub Pages from the `main` branch.

- `index.html` — the main site
- `cadex/` — the Cadex product site, served at `/cadex/`

## Run the site locally

The site is plain static files, so there's nothing to install or build. You only need Python 3 (preinstalled on macOS).

1. From the repo root, start a local server:

   ```bash
   python3 -m http.server 8765
   ```

2. Open http://localhost:8765 for the main site and http://localhost:8765/cadex/ for the Cadex site.

3. Press `Ctrl+C` in the terminal to stop the server.

If port 8765 is already in use, pick any other free port, for example `python3 -m http.server 9000`, and use that number in the URLs.

Use a local server rather than opening `index.html` directly from Finder. Links such as "Visit Cadex" point to `cadex/`, which only resolves to `cadex/index.html` when a server is running.
