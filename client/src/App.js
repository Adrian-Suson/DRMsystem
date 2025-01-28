import React, {useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "scenes/layout/layout"; // Ensure correct path
import Families from "scenes/Family/Families"; // Ensure correct path
import Login from "scenes/login/login"; // Ensure correct path
import AboutUs from "scenes/about/AboutUs"; // Ensure correct path
import TotalAffectedChart from "scenes/chart/TotalAffectedChart"; // Ensure correct path
import FamilyMembersList from "scenes/Family/FamilyMembersList"; // Ensure correct path
import Dashboard from "scenes/dashboard/dashboard";
import AffectedFamilies from "scenes/AffectedFamilies/AffectedFamilies";
import DisasterIncidents from "scenes/DisasterIncidents/DisasterIncidents";
import Users from "scenes/users/users";
import Setups from "scenes/Setups/Setups";
function App() {

  // Example state to manage the dialog visibility
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFamilyId(null);
  };

  return (
    <div className="app">
      <BrowserRouter>
            <Routes>
              {/* Route for login page */}
              <Route path="/" element={<Login />} />

              {/* Protected routes wrapped in Layout */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/families" element={<Families />} />
                <Route path="/affected-families" element={<AffectedFamilies />} />
                <Route path="/disaster-incidents" element={<DisasterIncidents />} />
                <Route
                  path="/total-affected-chart"
                  element={<TotalAffectedChart />}
                />
                <Route path="/users" element={<Users />} />
                <Route path="/setups" element={<Setups />} />

                <Route path="/about-us" element={<AboutUs />} />
              </Route>
            </Routes>

            {/* Family Members List Dialog */}
            {selectedFamilyId !== null && (
              <FamilyMembersList
                familyId={selectedFamilyId}
                open={dialogOpen}
                onClose={handleCloseDialog}
              />
            )}
      </BrowserRouter>
    </div>
  );
}

export default App;
