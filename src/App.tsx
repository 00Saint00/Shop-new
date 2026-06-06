import { useState, useEffect } from "react";
import "./index.css";
import SplashScreen from "./components/splashScreen/SplashScreen";
import Header from "./pages/header/Header";
import { AnimatePresence } from "framer-motion";
// import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import CheckEmailPage from "./pages/auth/CheckEmailPage";
import AuthRoute from "./utils/AuthRoute";
import HomePage from "./pages/home/HomePage";
import Footer from "./components/footer/Footer";
import { useDispatch } from "react-redux";
import {
  setUser,
  setProfile,
  logout,
  setAuthReady,
} from "@/store/slice/authSlice";
import { supabase } from "@/lib/supabase";
import { Toaster } from "./components/ui/sonner";
import Profile from "./pages/profile/Profile";
import ProductDetail from "./pages/productDetail/ProductDetail";
import Shop from "./pages/shop/Shop";
import Men from "./pages/shop/men/Men";
import Women from "./pages/shop/women/Women";
import Electronics from "./pages/shop/electronics/Electronics";
import Fragrances from "./pages/shop/fragrances/Fragrances";
import Brands from "./pages/brands/Brands";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { Cart } from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import CheckoutConfirmation from "./pages/checkout/CheckoutConfirmation";
import Dashboard from "./pages/dashboard/Dashboard";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const syncAuth = async (
      user: { id: string; email_confirmed_at?: string | null } | null,
    ) => {
      if (!user) {
        dispatch(logout());
      } else {
        dispatch(setUser(user));

        // Check if email is verified and update approved status if needed
        // The database trigger should handle this, but we check here as a backup
        if (user.email_confirmed_at) {
          const { data: userCheck } = await supabase
            .from("users")
            .select("approved")
            .eq("id", user.id)
            .single();

          // If email is verified but user is not approved, trigger the update
          // (This is a backup - the database trigger should handle it automatically)
          if (userCheck && !userCheck.approved) {
            await supabase
              .from("users")
              .update({ approved: true })
              .eq("id", user.id);
          }
        }

        // Load user profile data
        const { data: userRow } = await supabase
          .from("users")
          .select("id, full_name, email, avatar, approved, role")
          .eq("id", user.id)
          .single();
        // customers table: no approved column (removed); we only use phone, address
        const { data: customerRow } = await supabase
          .from("customers")
          .select("phone, address")
          .eq("id", user.id)
          .maybeSingle();
        const { data: sellerRow } = await supabase
          .from("seller")
          .select(
            "store_name, contact_number, status, store_description, business_address",
          )
          .eq("id", user.id)
          .maybeSingle();

        const profile = userRow
          ? {
              ...userRow,
              // role: sellerRow?.status === "approved" ? "seller" : "customer",
              role:
                userRow?.role === "admin"
                  ? "admin"
                  : sellerRow?.status === "approved"
                    ? "seller"
                    : "customer",
              phone: customerRow?.phone ?? null,
              address: customerRow?.address ?? null,
              store_name: sellerRow?.store_name ?? null,
              contact_number: sellerRow?.contact_number ?? null,
              status: sellerRow?.status ?? null,
              store_description: sellerRow?.store_description ?? null,
              business_address: sellerRow?.business_address ?? null,
            }
          : null;
        dispatch(setProfile(profile));
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
            <Route path="/auth/check-email" element={<CheckEmailPage />} />
          </Route>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id/:slug" element={<ProductDetail />} />
          <Route path="/shop/brand/:brandSlug" element={<Shop />} />
          <Route path="/shop/men" element={<Men />} />
          <Route path="/shop/women" element={<Women />} />
          <Route path="/shop/electronics" element={<Electronics />} />
          <Route path="/shop/fragrances" element={<Fragrances />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:sortBy" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Private routes: require login; guests are redirected to /auth */}
          <Route element={<AuthRoute type="private" />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/checkout/confirmation/:orderId"
              element={<CheckoutConfirmation />}
            />
          </Route>
          <Route element={<AuthRoute type="admin" />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>

        <Footer />
      </Router>
    </>
  );
}

export default App;
