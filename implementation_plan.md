# Implementation Plan - PWA & GitHub

The goal is to transform the existing Node.js application into a Progressive Web App (PWA) and push the code to the user's GitHub repository.

## User Review Required
> [!IMPORTANT]
> The application requires a Node.js server to run (`node server.js`). While the PWA features (installability, caching) will work, the app cannot be hosted on static hosting services like GitHub Pages if the backend logic (API, file writing) is required. It must be hosted on a platform that supports Node.js (e.g., Render, Railway, Heroku).

## Proposed Changes

### PWA Assets
#### [NEW] [manifest.json](file:///c:/Users/Administrador/Desktop/EVA3_BodyForge_Store/public/manifest.json)
- Define app name, description, start URL, display mode (standalone), and icons.

#### [NEW] [service-worker.js](file:///c:/Users/Administrador/Desktop/EVA3_BodyForge_Store/public/service-worker.js)
- Implement a basic caching strategy (Cache First for assets, Network First for API) to allow offline access to visited pages.

#### [NEW] [icon.png](file:///c:/Users/Administrador/Desktop/EVA3_BodyForge_Store/public/images/icon-512.png)
- Generate a 512x512 icon for the PWA.

### Frontend Updates
#### [MODIFY] [index.html](file:///c:/Users/Administrador/Desktop/EVA3_BodyForge_Store/public/index.html)
- Link `manifest.json`.
- Add script to register `service-worker.js`.
- Add `meta` tags for theme color and viewport.

### Git Setup
- Initialize Git repository.
- Create `.gitignore`.
- Add remote `https://github.com/JoaoCorozo/BodyForgeStore.git`.
- Commit and Push.

## Verification Plan
### Automated Tests
- None.

### Manual Verification
- Run the server (`node server.js`).
- Open in Chrome.
- Verify "Install App" icon appears in the address bar.
- Check DevTools > Application > Manifest to ensure no errors.
- Check DevTools > Application > Service Workers to ensure registration.
- Verify GitHub repo has the code.
