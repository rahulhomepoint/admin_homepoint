import Slidebar from "./Components/Slidebar";
// import NavbarTab from "./Components/Navbar";
import { Routes, Route } from "react-router-dom";
import Login from "./Components/Auth/Login";
// import Dashboard from "./Components/Dashboard/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";
import NotFound from "./Components/NotFound";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";

export default function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Slidebar />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
