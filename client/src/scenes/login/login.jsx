import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [systemTitle, setSystemTitle] = useState(""); // Dynamic system title
  const [logo, setLogo] = useState(""); // Dynamic logo (Base64)
  const navigate = useNavigate();

  // Fetch dynamic logo and title on mount
  useEffect(() => {
    const fetchLogoAndTitle = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7777/logos/1" // Replace `1` with the appropriate VersionID
        );

        const { TitleText, LogoBlob } = response.data;
        setSystemTitle(TitleText);
        setLogo(LogoBlob ? `data:image/png;base64,${LogoBlob}` : ""); // Convert Base64 to usable image
      } catch (error) {
        console.error("Error fetching logo and title:", error.message);
      }
    };

    fetchLogoAndTitle();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:7777/users/login", {
        username,
        password,
      });

      if (response.status === 200) {
        // Successful login
        console.log("Login successful!");
        setLoginError(false); // Reset login error state
        // Save user data in localStorage
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem(
          "profilePicture",
          response.data.profile_picture
        );
        // Redirect to the dashboard
        navigate("/dashboard");
      } else {
        console.error("Login failed with status:", response.status);
        setLoginError(true);
      }
    } catch (error) {
      // Handle login error
      if (error.response) {
        console.error("Login failed with response error:", error.response.data);
      } else if (error.request) {
        console.error("Login failed with no response:", error.request);
      } else {
        console.error("Login failed with error:", error.message);
      }
      setLoginError(true);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Dynamic Title */}
      <Box
        sx={{
          mb: 3,
          fontSize: "2rem",
          fontWeight: "700",
          color: "black",
          "&:hover": { color: "grey" },
          textAlign: "center",
        }}
      >
        {systemTitle || "Loading..."} {/* Fallback while fetching */}
      </Box>

      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
          borderRadius: "8px",
          boxShadow: 3,
          p: 4,
        }}
      >
        {/* Dynamic Logo */}
        {logo && (
          <Box
            component="img"
            src={logo} // Dynamic logo from Base64
            borderRadius="1rem"
            width="100px"
            height="100px"
          />
        )}

        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: "700" }}>
          Log In
        </Typography>
        <form onSubmit={handleLogin} noValidate sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Center the button horizontally
              mt: 3,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#0059FF", // Light blue color
                padding: "8px 24px", // Adjust padding to make the button smaller
                fontSize: "0.875rem", // Adjust font size for a modern look
                borderRadius: "8px", // Rounded corners for a modern look
                textTransform: "none", // Remove uppercase transformation
                "&:hover": { backgroundColor: "#87CEEB" }, // Slightly darker blue on hover
              }}
            >
              Log In
            </Button>
          </Box>
          {loginError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Incorrect username or password. Please try again.
            </Typography>
          )}
        </form>
      </Container>
    </Box>
  );
};

export default LoginForm;
