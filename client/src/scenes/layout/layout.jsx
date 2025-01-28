import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Box, Grid, CssBaseline, Container } from "@mui/material";
import logo from "assets/logos.jpg";
import Sidebar from "components/Sidebar";
import { Outlet } from "react-router-dom";
import axios from "axios";

const Layout = () => {
  // State for dynamic data
  const [dynamicTitle, setDynamicTitle] = useState("Loading...");
  const [rightLogo, setRightLogo] = useState(null);

  // Fetch the dynamic title and logo
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const response = await axios.get("http://localhost:7777/logos/1"); // Replace with your API endpoint
        if (response.data) {
          setDynamicTitle(response.data.TitleText || "Default Title"); // Fallback title
          setRightLogo(response.data.LogoBlob); // Base64 logo
        }
      } catch (error) {
        console.error("Error fetching dynamic data:", error);
      }
    };

    fetchDynamicData();
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <CssBaseline />

      {/* Header (AppBar) */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#FFFFFF",
          padding: "8px 16px",
          borderRadius: "0px",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "60px" }}>
          <Grid container alignItems="center">
            {/* Left Logo */}
            <Grid item>
              <Box
                display="flex"
                alignItems="center"
                borderRadius="50%"
                overflow="hidden"
              >
                <Box
                  component="img"
                  src={logo} // Static left logo
                  width="50px"
                  height="50px"
                  sx={{ borderRadius: "50%" }}
                />
              </Box>
            </Grid>

            {/* Dynamic Title */}
            <Grid item xs>
              <Typography
                variant="h6"
                sx={{
                  color: "#333",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" }, // Adjusted size for responsiveness
                  whiteSpace: "nowrap", // Prevents wrapping
                  overflow: "hidden", // Ensures overflow text doesn't display outside the container
                  textOverflow: "ellipsis", // Adds an ellipsis to long text
                }}
              >
                {dynamicTitle} {/* Dynamic title */}
              </Typography>
            </Grid>

            {/* Dynamic Right Logo */}
            <Grid item>
              <Box
                display="flex"
                alignItems="center"
                borderRadius="50%"
                overflow="hidden"
              >
                {rightLogo ? (
                  <Box
                    component="img"
                    src={`data:image/png;base64,${rightLogo}`} // Dynamic right logo
                    width="50px"
                    height="50px"
                    sx={{ borderRadius: "50%" }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Loading...
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Main content wrapper */}
      <Box
        sx={{
          display: "flex",
          marginTop: "64px", // Adjusted based on new AppBar height
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, padding: "16px" }}>
          <Container
            sx={{
              mt: 2,
              backgroundColor: "#DDDDDDFF",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "16px",
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
