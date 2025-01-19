import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { logActivity } from "services/activityLogService";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

const FamilyMembersList = ({ familyId, open, onClose }) => {
  const [members, setMembers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchMembers = useCallback(async () => {
    try {
      console.log("Fetching members for family:", familyId); // Debug log
      const response = await axios.get(
        `http://localhost:7777/familyMembers/${familyId}`
      );
      if (response.data) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      if (error.response?.status === 404) {
        setMembers([]); // Clear members if none found
      }
    }
  }, [familyId]);

  useEffect(() => {
    if (open) {
      if (familyId) {
        fetchMembers();
      } else {
        setMembers([]); // Clear members if familyId is not available
      }
    }
  }, [open, familyId, fetchMembers]);

  const handleDelete = async (id, memberName) => {
    try {
      console.log("Deleting member with ID:", id, "from family:", familyId); // Debug log

      const response = await axios.delete(
        `http://localhost:7777/familyMembers/${id}`
      );

      if (response.status >= 200 && response.status < 300) {
        await logActivity(
          "DELETE_FAMILY_MEMBER",
          `Deleted family member: ${memberName} (ID: ${id}) from Family ID: ${familyId}`
        );

        await fetchMembers(); // Wait for fetch to complete
        setSnackbarMessage("Member deleted successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error(`Error deleting member ${id}:`, error);
      setSnackbarMessage(
        error.response?.status === 404
          ? "Member not found"
          : "Error deleting member"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Family Members</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Birth Date</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length > 0 ? (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.age}</TableCell>
                      <TableCell>{member.gender}</TableCell>
                      <TableCell>{member.status}</TableCell>
                      <TableCell>
                        {new Date(member.birthDate).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDelete(member.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FF6B6B",
              color: "#fff",
              marginRight: "10px",
            }}
            onClick={onClose}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

FamilyMembersList.propTypes = {
  familyId: PropTypes.number,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FamilyMembersList;
