import { Navigate } from "react-router-dom";
import { useAuth } from "./authcontext";

const ProtectedRoute = ({ element, requiredRole }) => {
  const { user } = useAuth();

  console.log("User data in ProtectedRoute:", user);

  if (user === null) {
    console.log("User state is null, waiting for authentication...");
    return null;
  }

  if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    console.log("Unauthorized. Redirecting to dashboard.");
    return <Navigate to="/dashboard" />;
  }

  return element;
};

export default ProtectedRoute;
