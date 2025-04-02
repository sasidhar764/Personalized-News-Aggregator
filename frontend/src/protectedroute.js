import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ element, requiredRole }) => {
  const user = localStorage.getItem("user");
  const isAuthenticated = !!user;

  let hasRequiredRole = true;
  if (requiredRole && isAuthenticated) {
    try {
      const userData = JSON.parse(user);
      hasRequiredRole = userData.role === requiredRole;
    } catch (error) {
      console.error("Error parsing user data:", error);
      hasRequiredRole = false;
    }
  }

  if (isAuthenticated && hasRequiredRole) {
    return element;
  }

  return <Navigate to="/" replace />;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;
