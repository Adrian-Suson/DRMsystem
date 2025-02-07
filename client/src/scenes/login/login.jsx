import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [systemTitle, setSystemTitle] = useState("");
  const [logo, setLogo] = useState("");
  const [loginBackground, setLoginBackground] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dynamic logo, title, and background on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:7777/logos/1");

        const { TitleText, Logo, LoginBackground } = response.data;
        console.log(response.data);
        setSystemTitle(TitleText);
        setLogo(Logo ? `data:image/png;base64,${Logo}` : "");
        setLoginBackground(
          LoginBackground ? `data:image/png;base64,${LoginBackground}` : ""
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching login page assets:", error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const response = await axios.post("http://localhost:7777/users/login", {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("profilePicture", response.data.profile_picture);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response) {
        setLoginError(
          error.response.data.message || "Invalid username or password."
        );
      } else {
        setLoginError("Failed to connect to the server. Please try again.");
      }
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
        backgroundImage: loginBackground ? `url(${loginBackground})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dynamic Title */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: "white",
          textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
        {loading ? (
          <CircularProgress color="inherit" size={24} />
        ) : (
          systemTitle || "Loading..."
        )}
      </Typography>

      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(255, 255, 255, 0.85)",
          borderRadius: "12px",
          boxShadow: 3,
          p: 4,
          backdropFilter: "blur(10px)", // Blurred background for a glass effect
        }}
      >
        {/* Dynamic Logo */}
        {logo ? (
          <Box
            component="img"
            src={logo}
            alt="System Logo"
            sx={{
              borderRadius: "8px",
              width: "100px",
              height: "100px",
              mb: 2,
            }}
          />
        ) : (
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            Logo not available
          </Typography>
        )}

        <Typography
          component="h1"
          variant="h5"
          sx={{ mb: 3, fontWeight: "700" }}
        >
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
              justifyContent: "center",
              mt: 3,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#0059FF",
                padding: "10px 30px",
                fontSize: "1rem",
                borderRadius: "10px",
                textTransform: "none",
                "&:hover": { backgroundColor: "#87CEEB" },
              }}
            >
              Log In
            </Button>
          </Box>

          {/* Display login error message */}
          {loginError && (
            <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
              {loginError}
            </Typography>
          )}
        </form>
      </Container>
    </Box>
  );
};

export default LoginForm;
