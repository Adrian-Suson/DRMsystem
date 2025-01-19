import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  ListItemButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { People, ExitToApp } from "@mui/icons-material";
import { FaUpload } from "react-icons/fa";
import InfoIcon from "@mui/icons-material/Info";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { IoPeople } from "react-icons/io5";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment"; // For incidents
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "state/api";
import axios from "axios";
import ActivityLogDialog from "./ActivityLogDialog";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const userRole = localStorage.getItem("role");
  const [modifiedFields, setModifiedFields] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const image = localStorage.getItem("profilePicture");
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    role: "",
    profile_picture: "",
  });

  const handleLogout = () => {
    // Clear only specific items
    localStorage.removeItem("name");
    localStorage.removeItem("id");
    localStorage.removeItem("profilePicture");

    // Navigate to login
    navigate("/");
  };

  const handleProfileClick = async () => {
    const id = localStorage.getItem("id");
    try {
      const response = await axios.get(`${config.URL}/users/${id}`);
      const profileData = response.data;
      setProfile({
        ...profileData,
      });
      console.log("profileData:", profileData);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    handleFieldChange("profile_picture", file);
  };

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const imageUrl = `http://127.0.0.1:7777/assets/profiles/${image}`;
    setProfileImage(imageUrl);
    console.log("image:", image);
  }, [image]);

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setModifiedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewActivityLog = () => setActivityLogOpen(true);

  const handleSave = async () => {
    const id = localStorage.getItem("id");
    if (Object.keys(modifiedFields).length === 0) {
      return;
    }

    try {
      const formData = new FormData();

      // Add all modified fields to formData
      Object.keys(modifiedFields).forEach((key) => {
        if (key === "profile_picture" && modifiedFields[key] instanceof File) {
          formData.append("profile_picture", modifiedFields[key]);
        } else {
          formData.append(key, modifiedFields[key]);
        }
      });

      const response = await axios.put(
        `http://localhost:7777/users/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.profile_picture) {
        setProfile((prev) => ({
          ...prev,
          profile_picture: response.data.profile_picture,
        }));
      }

      setEditMode(false);
      setOpen(false);
      setModifiedFields({});
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const userName = localStorage.getItem("name");

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        color: "black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "15px",
        boxSizing: "border-box",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease",
        width: "250px",
        height: "calc(100vh - 60px)",
        overflowY: "auto",
      }}
    >
      {/* Profile Section */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        my={2}
        onClick={handleProfileClick}
        sx={{ cursor: "pointer" }}
      >
        <Avatar
          src={imagePreview || profileImage}
          sx={{ width: 100, height: 100, mb: 2 }}
          alt={profile.name || "Profile picture"}
        >
          {!imagePreview && !profile.profile_picture && profile.name?.[0]}
        </Avatar>
        <Typography variant="h6">{userName}</Typography>
      </Box>

      {/* Profile Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        PaperProps={{
          sx: {
            width: "600px",
            minHeight: "400px",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>Profile</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{ p: 2 }}
          >
            <Avatar
              src={
                imagePreview ||
                (profile.profile_picture
                  ? `${config.URL}/assets/profiles/${profile.profile_picture}`
                  : null)
              }
              sx={{ width: 100, height: 100, mb: 2 }}
              alt={profile.name || "Profile picture"}
            >
              {!imagePreview && !profile.profile_picture && profile.name?.[0]}
            </Avatar>
            {editMode ? (
              <>
                <TextField
                  label="Name"
                  value={profile.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  margin="normal"
                  fullWidth
                />
                <TextField
                  label="Username"
                  value={profile.username}
                  onChange={(e) =>
                    handleFieldChange("username", e.target.value)
                  }
                  margin="normal"
                  fullWidth
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={profile.password || ""}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  margin="normal"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ mt: 2, mb: 2 }}>
                  <input
                    accept="image/*"
                    type="file"
                    id="profile-picture-input"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="profile-picture-input">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<FaUpload />}
                    >
                      Upload Profile Picture
                    </Button>
                  </label>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body1">Name: {profile.name}</Typography>
                <Typography variant="body1">
                  Username: {profile.username}
                </Typography>
                <Typography variant="body1">Role: {profile.role}</Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewActivityLog} color="primary">
            View Activity Log
          </Button>
          {editMode ? (
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          ) : (
            <Button onClick={handleEdit} color="primary">
              Edit
            </Button>
          )}
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main list container grows to fill available height */}
      <Box display="flex" flexDirection="column" flexGrow={1} mb={1}>
        <List component="nav">
          <Typography
            sx={{
              marginTop: "2px",
              marginBottom: "5px",
              fontSize: "14px",
              color: "#555555",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Home
          </Typography>
          {[
            {
              text: "Dashboard",
              icon: <DashboardIcon />,
              path: "/dashboard",
            },
            {
              text: "Families",
              icon: <People />,
              path: "/families",
            },
            {
              text: "Chart",
              icon: <ShowChartIcon />,
              path: "/total-affected-chart",
            },
          ].map((item, index) => (
            <ListItemButton
              key={index}
              component={Link}
              to={item.path}
              sx={{
                backgroundColor: "transparent",
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "5px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#F0F0F0",
                },
                ...(location.pathname === item.path && {
                  backgroundColor: "#1565C0",
                  "&:hover": {
                    backgroundColor: "#0d47a1",
                  },
                  "& .MuiListItemText-root": {
                    color: "#FFF",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#FFF",
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? "#FFF" : "#000",
                  minWidth: "30px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  fontSize: "14px",
                  color: location.pathname === item.path ? "#FFF" : "#000",
                }}
              />
            </ListItemButton>
          ))}

          {/* New Section for Disaster Records */}
          <Typography
            sx={{
              marginTop: "2px",
              marginBottom: "5px",
              fontSize: "14px",
              color: "#555555",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Disaster Records
          </Typography>
          {[
            {
              text: "Disaster Incidents",
              icon: <LocalFireDepartmentIcon />,
              path: "/disaster-incidents",
            },
            {
              text: "Affected Families",
              icon: <People />,
              path: "/affected-families",
            },
          ].map((item, index) => (
            <ListItemButton
              key={index}
              component={Link}
              to={item.path}
              sx={{
                backgroundColor: "transparent",
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "5px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#F0F0F0",
                },
                ...(location.pathname === item.path && {
                  backgroundColor: "#1565C0",
                  "&:hover": {
                    backgroundColor: "#0d47a1",
                  },
                  "& .MuiListItemText-root": {
                    color: "#FFF",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#FFF",
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? "#FFF" : "#000",
                  minWidth: "30px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  fontSize: "14px",
                  color: location.pathname === item.path ? "#FFF" : "#000",
                }}
              />
            </ListItemButton>
          ))}

          {/* New Section for Management */}
          {userRole === "admin" && (
            <>
              <Typography
                sx={{
                  marginTop: "2px",
                  marginBottom: "5px",
                  fontSize: "14px",
                  color: "#555555",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Management
              </Typography>
              {[
                {
                  text: "Users",
                  icon: <IoPeople />,
                  path: "/users",
                },
                {
                  text: "About Us",
                  icon: <InfoIcon />,
                  path: "/about-us",
                },
              ].map((item, index) => (
                <ListItemButton
                  key={index}
                  component={Link}
                  to={item.path}
                  sx={{
                    backgroundColor: "transparent",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    marginBottom: "5px",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#F0F0F0",
                    },
                    ...(location.pathname === item.path && {
                      backgroundColor: "#1565C0",
                      "&:hover": {
                        backgroundColor: "#0d47a1",
                      },
                      "& .MuiListItemText-root": {
                        color: "#FFF",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "#FFF",
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? "#FFF" : "#000",
                      minWidth: "30px",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      fontSize: "14px",
                      color: location.pathname === item.path ? "#FFF" : "#000",
                    }}
                  />
                </ListItemButton>
              ))}
            </>
          )}
        </List>
      </Box>
      

      {/* Fixed logout button at the bottom */}
      <Box>
        <Divider
          sx={{
            marginBottom: "16px",
            backgroundColor: "#BBBBBB",
          }}
        />
        <Button
          onClick={handleLogout}
          startIcon={<ExitToApp />}
          sx={{
            backgroundColor: "#555555",
            color: "#fff",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: "bold",
            borderRadius: "8px",
            width: "100%",
            "&:hover": {
              backgroundColor: "#333333",
            },
          }}
        >
          Log Out
        </Button>
      </Box>
      <ActivityLogDialog
        open={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
      />
    </Box>
  );
};

export default Sidebar;
