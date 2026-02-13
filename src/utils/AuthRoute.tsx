import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/Store";

const AuthRoute = ({ type }: { type: "public" | "private" }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const authReady = useSelector((state: RootState) => state.auth.authReady);

  if (!authReady) {
    return <div>Loading...</div>;
  }

  if (type === "private") {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return <Outlet />;
  }

  // PUBLIC route logic (login/register pages)
  if (type === "public") {
    if (user) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }

  return null;
};

export default AuthRoute;
