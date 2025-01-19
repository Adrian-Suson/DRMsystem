import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Modal,
  TextField,
  IconButton,
  MenuItem,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { logActivity } from "services/activityLogService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:7777/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const formData = new FormData();
      formData.append("username", newUser.username);
      formData.append("password", newUser.password);
      formData.append("name", newUser.name);
      formData.append("role", newUser.role);
      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }

      const response = await axios.post(
        "http://localhost:7777/users",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        await logActivity(
          "ADD_USER",
          `Added new user: ${newUser.username} with role: ${newUser.role}`
        );
        setOpen(false);
        fetchUsers();
        setNewUser({ name: "", username: "", password: "", role: "" });
        setSelectedFile(null);
      } else {
        console.error("Failed to add user:", response);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewUser(user)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Add New User
          </Typography>
          <TextField
            fullWidth
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Username"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            margin="normal"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>

          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadIcon />}
              >
                Upload Profile Picture
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="caption" display="block" mt={1}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
          </Box>

          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddUser}>
              Add
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {selectedUser && (
            <>
              <Typography variant="h6" mb={3}>
                User Details
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Avatar
                  src={
                    selectedUser.profile_picture
                      ? `http://localhost:7777/assets/profiles/${selectedUser.profile_picture}`
                      : null
                  }
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedUser.name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1">{selectedUser.username}</Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Role
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ textTransform: "capitalize" }}
                >
                  {selectedUser.role}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={() => setViewOpen(false)}>Close</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Users;
