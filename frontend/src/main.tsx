import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./calendar-fix.css"; // Import the calendar-specific styles
import { fixPointerEvents } from "./lib/pointer-events-fix";
import { applyCalendarFixes } from "./lib/calendar-fix";

// Apply fixes
fixPointerEvents();
applyCalendarFixes();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
