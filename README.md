# Car comparison

A public, source-backed comparison of four Toyota Corolla Touring Sports listings, with a Russian-language interface.

## Scope

- Listing price, mileage, registration, production date, seller and equipment.
- Source links and explicit unknowns; seller statements are not inspection results.
- Shared ownership horizon and annual distance.
- Optional import/registration costs and manually editable resale intervals.
- No analytics, tracking scripts, accounts or client-input uploads.

The initial resale scenarios are judgmental estimates for a four-year hold at 20,000 km/year and a private sale in the Netherlands. They are not transaction-price data, guaranteed buybacks or automatically mileage-adjusted forecasts. Cars without an estimate remain blank rather than receiving invented valuations. Import costs default to zero because they have not been quoted, not because importing is free.

## Run and verify

Requires Node.js 22 and Python 3.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. Data is loaded from `cars.json`.

The browser test verifies all four columns, recalculation, input-driven depreciation, mobile overflow and absence of runtime errors. GitHub Actions runs both test layers before deployment.

## Publishing

GitHub Pages uses the Actions workflow. Only `index.html`, `style.css`, `app.mjs`, `model.mjs` and `cars.json` are uploaded. Deployments run from `main` after verification; contributions land through pull requests. Public site: https://mcplafed.github.io/car-comparison/

## Updating evidence

Keep original listing IDs and URLs unchanged. Record the evidence-check date. Use `null` for unknown facts, including accident history and omitted equipment. Do not infer equipment solely from package names, first-registration year or power output. Do not commit VINs, personal contact details, chat metadata, credentials or private buyer information.
