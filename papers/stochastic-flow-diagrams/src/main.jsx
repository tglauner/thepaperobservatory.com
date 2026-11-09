import React from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "./styles.css";
import App from "./App.jsx";

class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error) {
    console.error("Flow Observatory rendering failure:", error.message);
  }
  render() {
    if (this.state.error)
      return (
        <main className="recovery">
          <h1>The experiment needs a reset.</h1>
          <p>Reload the page to restore the default teaching examples.</p>
          <button onClick={() => location.reload()}>
            Reload the observatory
          </button>
        </main>
      );
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
