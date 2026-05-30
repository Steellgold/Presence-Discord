import React from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";
import "./styles.css";

const rootElement = document.querySelector("#root");

if (rootElement === null) {
  throw new Error("Popup root element was not found.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
