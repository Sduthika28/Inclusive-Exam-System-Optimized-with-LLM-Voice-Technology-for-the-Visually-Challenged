import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  const navigate = useNavigate();

  if (!auth) {
    
    navigate("/login");
    return null;
  }

  return children;
}

export default ProtectedRoute;
