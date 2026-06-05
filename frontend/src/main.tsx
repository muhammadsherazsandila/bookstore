import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "@/store/store";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(224 40% 8%)",
              color: "hsl(210 40% 92%)",
              border: "1px solid hsl(217 33% 16%)",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            success: {
              iconTheme: {
                primary: "hsl(263 70% 58%)",
                secondary: "hsl(0 0% 100%)",
              },
            },
            error: {
              iconTheme: {
                primary: "hsl(0 72% 51%)",
                secondary: "hsl(0 0% 100%)",
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
