import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import App from "./App.tsx";
import "./index.css";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: "https://app.posthog.com",
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
