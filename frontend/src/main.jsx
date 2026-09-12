import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
import ShopContextProvider from "./context/ShopContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ShopContextProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </ShopContextProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);

