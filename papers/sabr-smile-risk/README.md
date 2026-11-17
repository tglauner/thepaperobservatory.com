# The Smile Observatory

An interactive educational companion to Hagan, Kumar, Lesniewski, and Woodward's 2002 article *Managing Smile Risk*. It visualizes the four SABR parameters and compares the paper's qualitative account of local-volatility and SABR smile dynamics after a forward shock.

## Run locally

From the repository root:

```bash
npm install
npm run dev --workspace papers/sabr-smile-risk
```

Open <http://127.0.0.1:5176/sabr-smile-risk/>. The full collection launcher also includes this workspace at <http://127.0.0.1:5173/sabr-smile-risk/>. Run `npm test` and `npm run build` at the root for all workspaces.

The original PDF is a local-only, ignored source copy. It is never redistributed in Git or the assembled website. Without that file, the companion links to the source copy supplied for this project.

## Scope

The controls use declared educational parameters and a one-step Brownian teaching shock. The local-volatility curve is a qualitative translation in the direction described by the paper, not a Dupire recalibration or PDE solution. No market calibration, live data, hedge performance, forecast, or investment advice is provided.
