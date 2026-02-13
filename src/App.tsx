import { useState, useEffect } from "react";
import "./index.css";
import SplashScreen from "./components/splashScreen/SplashScreen";
import Header from "./components/header/Header";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";
import AuthRoute from "./utils/AuthRoute";
import HomePage from "./components/home/HomePage";
import Footer from "./components/footer/Footer";
import { useDispatch } from "react-redux";
import { setUser, setProfile, logout, setAuthReady } from "@/store/slice/authSlice";
import { supabase } from "@/lib/supabase";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const syncAuth = async (user: { id: string } | null) => {
      if (!user) {
        dispatch(logout());
      } else {
        dispatch(setUser(user));
        const { data: profile } = await supabase
          .from("users")
          .select("full_name, email, avatar")
          .eq("id", user.id)
          .single();
        dispatch(setProfile(profile ?? null));
      }
      dispatch(setAuthReady(true));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncAuth(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuth(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

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
          {/* Public route: redirects logged-in users to home */}
          <Route element={<AuthRoute type="public" />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route path="/" element={<HomePage />} />
        </Routes>

        <Footer />
      </Router>
    </>
  );
}

export default App;
