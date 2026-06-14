import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export function ProtectedRoute({ children }) {
  const { user, isBootstrapping } = useAuthStore();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading NxtBiz...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
