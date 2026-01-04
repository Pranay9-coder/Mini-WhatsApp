import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChatList from "./pages/ChatList.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

const App = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="layout">
                <ChatList />
                <ChatRoom />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div style={{ padding: "24px" }}>
              <h2>Page not found</h2>
              <Link to="/">Go home</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
