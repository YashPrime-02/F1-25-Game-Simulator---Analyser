import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "./theme/variable.css";
import "./theme/dark.css";
import "./theme/light.css";

import { SoundProvider } from "./context/SoundContext";
import { SeasonProvider } from "./context/SeasonContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SoundProvider>
      <ThemeProvider>
        <SeasonProvider>
          <App />
        </SeasonProvider>
      </ThemeProvider>
    </SoundProvider>
  </React.StrictMode>
);