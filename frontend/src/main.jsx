import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
import ShopContextProvider from "./context/ShopContext.jsx";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1084869871142-cartivodemo.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);

