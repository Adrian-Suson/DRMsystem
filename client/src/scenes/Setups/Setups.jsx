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
} from "@mui/material";

function Setups() {
  const [logoFile, setLogoFile] = useState(null); // New logo file
  const [newLogoPreview, setNewLogoPreview] = useState(null); // Preview for new logo
  const [titleText, setTitleText] = useState("");
  const [description, setDescription] = useState("");
  const [existingLogo, setExistingLogo] = useState(null); // Existing logo from the database

  // Fetch existing logo and title on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get("http://localhost:7777/logos/1"); // Replace 1 with the actual ID
        if (response.data) {
          setTitleText(response.data.TitleText);
          setDescription(response.data.Description);
          setExistingLogo(response.data.LogoBlob); // Base64 string
        }
      } catch (error) {
        console.error("Error fetching logo:", error.message);
      }
    };

    fetchLogo();
  }, []);

  // Handle file input change
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    setLogoFile(file);

    // Generate a preview of the uploaded file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogoPreview(reader.result); // Set preview to Base64 string
      };
      reader.readAsDataURL(file);
    } else {
      setNewLogoPreview(null); // Reset if no file is selected
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
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

      alert("Logo and title updated successfully!");
      setExistingLogo(response.data.logoBlob); // Update the displayed logo
      setNewLogoPreview(null); // Clear the new logo preview
      setLogoFile(null); // Reset the file
    } catch (error) {
      console.error("Error updating logo and title:", error.message);
      alert("Failed to update logo and title.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        p: 4,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Logo and Title
      </Typography>

      {/* Display Current Logo */}
      {!newLogoPreview &&
        existingLogo && ( // Hide current logo when new logo preview exists
          <Card sx={{ maxWidth: 300 }}>
            <CardMedia
              component="img"
              height="200"
              image={`data:image/png;base64,${existingLogo}`}
              alt="Current Logo"
            />
            <CardContent>
              <Typography variant="h6" align="center">
                Current Logo
              </Typography>
            </CardContent>
          </Card>
        )}

      {/* Display New Logo Preview */}
      {newLogoPreview && (
        <Card sx={{ maxWidth: 300 }}>
          <CardMedia
            component="img"
            height="200"
            image={newLogoPreview}
            alt="New Logo Preview"
          />
          <CardContent>
            <Typography variant="h6" align="center">
              New Logo Preview
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Form for Editing Title and Uploading New Logo */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
          maxWidth: 400,
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

        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{ textTransform: "none" }}
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
          type="submit"
          variant="contained"
          color="primary"
          sx={{ textTransform: "none" }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default Setups;
