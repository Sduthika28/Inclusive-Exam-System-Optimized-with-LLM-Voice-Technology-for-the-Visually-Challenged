import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function Navbar() {
  const { auth, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>
      {auth ? (
        <>
          <Link to="/exam">Exam</Link>
          <Link to="/admin">Admin</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

export default Navbar;
