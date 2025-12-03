# Implementation Plan - Static Site Conversion

The goal is to convert the application into a static site so it can be hosted correctly on GitHub Pages. This involves moving frontend files to the root directory and removing dependencies on the Node.js backend.

## User Review Required
> [!WARNING]
> **Backend Removal**: The "Save Order" feature will no longer save to a database (`orders.json`) because GitHub Pages is static. I will update the checkout to simulate a successful order.
> **File Structure**: Frontend files (`index.html`, `css`, `js`) will be moved from `public/` to the root directory.

## Proposed Changes

### File Structure
- Move `public/index.html` -> `./index.html`
- Move `public/css/` -> `./css/`
- Move `public/js/` -> `./js/`
- Move `public/images/` -> `./images/`
- Move `public/manifest.json` -> `./manifest.json`
- Move `public/service-worker.js` -> `./service-worker.js`
- Copy `data/products.json` -> `./products.json`

### Code Updates
#### [MODIFY] [js/app.js](file:///c:/Users/Administrador/Desktop/EVA3_BodyForge_Store/public/js/app.js)
- Change product fetching URL from `/api/products` to `./products.json`.
- Update `submitOrder` to simulate success instead of POSTing to `/api/orders`.

#### [MODIFY] [index.html](file:///c:/Users/Administrador/Desktop/EVA3_BodyForge_Store/public/index.html)
- Update links if necessary (though relative paths should still work if folders are moved together).

#### [MODIFY] [service-worker.js](file:///c:/Users/Administrador/Desktop/EVA3_BodyForge_Store/public/service-worker.js)
- Update cache paths if needed.

## Verification Plan
### Manual Verification
- Open `index.html` directly in the browser (via Live Server or file protocol).
- Verify products load from `products.json`.
- Verify checkout flow shows success message.
- Push to GitHub and verify the live site loads the app instead of README.
