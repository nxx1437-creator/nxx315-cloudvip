import React from "react";
options: { redirectTo: `${window.location.origin}/dashboard` },

// Import các trang
import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Store from "./pages/Store.jsx";
import Admin from "./pages/Admin.jsx";
import Contact from "./pages/Contact.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import Support from "./pages/Support.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Fraud from "./pages/Fraud.jsx";
import RedemptionPolicy from "./pages/RedemptionPolicy.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CloudVIPLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/fraud" element={<Fraud />} />
        <Route path="/redemption-policy" element={<RedemptionPolicy />} />
      </Routes>
    </HashRouter>
  );
}
