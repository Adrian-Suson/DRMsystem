import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import logo from "assets/logos.jpg";
import logo2 from "assets/Picture2.jpeg";
import { Box, Grid, CssBaseline, Container } from "@mui/material";
import Sidebar from "components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <CssBaseline />

      {/* Header (AppBar) */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#FFFFFF",
          padding: "8px 16px",
          borderRadius: "0px", // Remove border radius
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "60px" }}>
          {" "}
          {/* Adjusted height */}
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
                  src={logo}
                  width="50px" // Further reduced logo size for balance
                  height="50px"
                  sx={{ borderRadius: "50%" }}
                />
              </Box>
            </Grid>

            {/* Title */}
            <Grid item xs>
              <Typography
                variant="h6" // Font size maintained
                sx={{
                  color: "#333",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: { xs: "1.2rem", md: "1.5rem" }, // Responsive font size
                }}
              >
                Brgy. Recodo Disaster Management
              </Typography>
            </Grid>

            {/* Right Logo */}
            <Grid item>
              <Box
                display="flex"
                alignItems="center"
                borderRadius="50%"
                overflow="hidden"
              >
                <Box
                  component="img"
                  src={logo2}
                  width="50px" // Further reduced logo size
                  height="50px"
                  sx={{ borderRadius: "50%" }}
                />
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
          {/* Reduced padding */}
          <Container
            sx={{
              mt: 2,
              backgroundColor: "#DDDDDDFF",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "16px", // Added padding for content
            }}
          >
            <Outlet /> {/* This will render the rest of the content */}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
