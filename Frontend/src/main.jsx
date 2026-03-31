import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./theme.css";
import "leaflet/dist/leaflet.css";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const store = createStore(reducers, compose(applyMiddleware(thunk)));
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ToastContainer
        position="top-right"
        autoClose={2600}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        theme="light"
        icon={({ type }) => {
          if (type === "success") return "✅";
          if (type === "error") return "❌";
          if (type === "warning") return "⚠️";
          return "🔔";
        }}
        toastStyle={{
          backgroundColor: "#fffef7",
          color: "#163a33",
          border: "2px solid #affa01",
          boxShadow: "0 10px 24px rgba(12, 52, 44, 0.16)",
          fontSize: "0.9rem",
          fontWeight: 600,
          padding: "10px 12px",
          borderRadius: "12px",
        }}
        style={{
          width: "auto",
          maxWidth: "360px",
          marginTop: "0.75rem",
        }}
        progressStyle={{
          backgroundColor: "#0c342c",
          height: "4px",
        }}
      />
      <App />
    </Provider>
  </StrictMode>
);
