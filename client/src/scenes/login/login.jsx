import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  useTheme,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "assets/Picture2.jpeg";
import backgroundImage from "assets/img1.png"; // Update the path to your background image
import axios from "axios";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

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
        // Save name in localStorage
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem(
          "profilePicture",
          response.data.profile_picture
        );
        // Log the name of the logged-in user
        console.log("Name:", response.data);
        // Redirect to the dashboard
        navigate("/dashboard");
      } else {
        console.error("Login failed with status:", response.status);
        setLoginError(true);
      }
    } catch (error) {
      // Failed login
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error("Login failed with response error:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error("Login failed with no response:", error.request);
      } else {
        // Something else happened
        console.error("Login failed with error:", error.message);
      }
      setLoginError(true);
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
        Barangay Recodo Disaster Risk Record Management System
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
        <Box
          component="img"
          src={logo}
          borderRadius="1rem"
          width="100px"
          height="100px"
        />
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mb: 3,
            fontSize: "2rem",
            fontWeight: "700",
            "&:hover": { color: theme.palette.grey[100] }, // Hover effect
          }}
        ></Typography>
        <Typography component="h1" variant="h5">
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
