import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import POSTransaction from "./pages/POS/POSTransaction";
import SystemSettings from "./pages/Settings/SystemSettings";
import FavoriteProducts from "./pages/Settings/FavoriteProducts";
import ProductList from "./pages/Products/ProductList";
import CategoryList from "./pages/Categories/CategoryList";
import MemberList from "./pages/Members/MemberList";
import UserList from "./pages/Users/UserList";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route index path="/" element={<Home />} />

            {/* Management Pages */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/members" element={<MemberList />} />

            {/* POS Pages */}
            <Route path="/pos" element={<POSTransaction />} />

            {/* Settings Pages */}
            <Route path="/settings" element={<SystemSettings />} />
            <Route path="/settings/favorites" element={<FavoriteProducts />} />

            {/* Others Page */}
            <Route path="/users" element={<UserList />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
