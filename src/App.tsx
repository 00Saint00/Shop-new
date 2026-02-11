import { useState } from "react";
import "./index.css";
import SplashScreen from "./components/splashScreen/SplashScreen";
import Header from "./components/header/Header";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#000",
            color: "#fff",
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            style: {
              background: "#000",
              border: "2px solid #10b981",
            },
          },
          error: {
            style: {
              background: "#000",
              border: "2px solid #ef4444",
            },
          },
        }}
      />
      <Router>
        <AnimatePresence mode="wait">
          <Header />
        </AnimatePresence>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
