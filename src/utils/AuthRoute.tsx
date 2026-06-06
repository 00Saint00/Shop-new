import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";

const AuthRoute = ({ type }: { type: "public" | "private" | "admin" }) => {
  const profile = useSelector((state: RootState) => state.auth.profile);
  const authReady = useSelector((state: RootState) => state.auth.authReady);

  if (!authReady) {
    return <div>Loading...</div>;
  }

  if (type === "admin") {
    if (!profile) {
      return <Navigate to="/auth" replace />;
    }
    if (profile?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }

  if (type === "private") {
    if (!profile) {
      return <Navigate to="/auth" replace />;
    }
    return <Outlet />;
  }

  // PUBLIC route logic (login/register pages)
  if (type === "public") {
    if (profile) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }

  return null;
};

export default AuthRoute;
