import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
} from "@mui/material";

function Setups() {
  const [logoFile, setLogoFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [newLogoPreview, setNewLogoPreview] = useState(null);
  const [newBackgroundPreview, setNewBackgroundPreview] = useState(null);
  const [titleText, setTitleText] = useState("");
  const [description, setDescription] = useState("");
  const [existingLogo, setExistingLogo] = useState(null);
  const [existingBackground, setExistingBackground] = useState(null);

  // Fetch existing logo, title, and login background on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:7777/logos/1");
        if (response.data) {
          setTitleText(response.data.TitleText);
          setDescription(response.data.Description);
          setExistingLogo(response.data.Logo);
          setExistingBackground(response.data.LoginBackground);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

  // Handle file input change for logo
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    setLogoFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setNewLogoPreview(null);
    }
  };

  // Handle file input change for background image
  const handleBackgroundChange = (event) => {
    const file = event.target.files[0];
    setBackgroundFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBackgroundPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setNewBackgroundPreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
    if (backgroundFile) formData.append("loginBackground", backgroundFile);
    formData.append("titleText", titleText);
    formData.append("description", description);

    try {
      const response = await axios.put(
        "http://localhost:7777/logos/1",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Logo, background, and title updated successfully!");
      setExistingLogo(response.data.logo);
      setExistingBackground(response.data.loginBackground);
      setNewLogoPreview(null);
      setNewBackgroundPreview(null);
      setLogoFile(null);
      setBackgroundFile(null);
    } catch (error) {
      console.error("Error updating data:", error.message);
      alert("Failed to update logo, background, or title.");
    }
  };

  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        overflowY: "auto", // Make the page scrollable when needed
        padding: 4,
        bgcolor: "#F4F6F8", // Light background
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        Edit Logo, Background & Title
      </Typography>

      {/* Grid Layout for Previews */}
      <Grid container spacing={3} justifyContent="center">
        {/* Current or New Logo */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              maxWidth: 320,
              textAlign: "center",
              boxShadow: 3,
              borderRadius: "10px",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={
                newLogoPreview ||
                (existingLogo ? `data:image/png;base64,${existingLogo}` : "")
              }
              alt="Logo"
            />
            <CardContent>
              <Typography variant="h6">
                {newLogoPreview ? "New Logo Preview" : "Current Logo"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current or New Background */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              maxWidth: 400,
              textAlign: "center",
              boxShadow: 3,
              borderRadius: "10px",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={
                newBackgroundPreview ||
                (existingBackground
                  ? `data:image/png;base64,${existingBackground}`
                  : "")
              }
              alt="Background"
            />
            <CardContent>
              <Typography variant="h6">
                {newBackgroundPreview
                  ? "New Background Preview"
                  : "Current Background"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Form Section */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
          maxWidth: 500,
          bgcolor: "white",
          padding: 4,
          borderRadius: "12px",
          boxShadow: 4,
        }}
      >
        <TextField
          label="Title"
          variant="outlined"
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />

        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{
            backgroundColor: "#007BFF",
            color: "white",
            "&:hover": { backgroundColor: "#0056b3" },
            borderRadius: "8px",
          }}
        >
          Upload New Logo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleLogoChange}
          />
        </Button>

        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{
            backgroundColor: "#28A745",
            color: "white",
            "&:hover": { backgroundColor: "#1E7E34" },
            borderRadius: "8px",
          }}
        >
          Upload New Background
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleBackgroundChange}
          />
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ textTransform: "none", borderRadius: "8px", fontSize: "1rem" }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default Setups;
