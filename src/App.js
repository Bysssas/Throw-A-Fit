import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages / Categories
import Home from "./categories/home";
import Upload from "./categories/upload";
import Closet from "./categories/closet";
import CategoryPage from "./categories/CategoryPage";
import Profile from "./categories/profile";
import ResetPassword from "./categories/resetPassword";

// Context Providers
import { UserProvider } from "./categories/UserContext";
import { ClosetProvider } from "./categories/ClosetContext";

export default function App() {
  return (
    <UserProvider>
      <ClosetProvider>
        <BrowserRouter>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<Home />} />

            {/* Upload Page */}
            <Route path="/upload" element={<Upload />} />

            {/* Closet Page */}
            <Route path="/closet" element={<Closet />} />

            {/* Profile Page */}
            <Route path="/profile" element={<Profile />} />

            {/* Dynamic Category Pages */}
            <Route path="/items/:category" element={<CategoryPage />} />

            {/* Reset Password Page */}
            <Route path="/reset-password" element={<ResetPassword />} /> {/* <-- added */}
          </Routes>
        </BrowserRouter>
      </ClosetProvider>
    </UserProvider>
  );
}
