# The HJM Observatory

An interactive educational companion to Heath, Jarrow, and Morton's 1992 forward-rate framework. Edit an illustrative curve, choose the shape and number of volatility factors, and compare the risk-neutral HJM drift and one-step curve response to a synthetic five-year shock.

## Local development

From the repository root:

```bash
npm run dev --workspace papers/hjm
```

Open http://127.0.0.1:5177/hjm/. Run the focused numerical checks with:

```bash
npm test --workspace papers/hjm
```

The local source PDF is retained privately in this paper folder and is not needed by the app. Public builds omit it and link to the canonical RePEc record.

## Scope and evidence

The visualization is a deterministic teaching experiment, not a market calibration or forecast. See [the source analysis](docs/paper-analysis.md) for the claim-to-page map, measure qualification, limitations, and source custody.
