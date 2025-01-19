import React from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useTheme } from "@emotion/react";
import { logActivity } from "services/activityLogService";

const DeleteFamily = ({ open, familyId, onClose, onDelete }) => {
  const theme = useTheme();

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:7777/families/${familyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Log the deletion activity
        await logActivity(
          "DELETE_FAMILY",
          `Deleted family with ID: ${familyId}`
        );

        // Show success message
        toast.success("Family deleted successfully");

        // Call the onDelete callback to refresh the data
        if (onDelete) onDelete();

        // Close the dialog
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(`Error deleting family with ID ${familyId}:`, error);
      toast.error("Error deleting family");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Family</DialogTitle>
      <DialogContent>
        <Typography variant="body1" mb="1rem">
          Are you sure you want to delete this family? This action cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDelete}
          variant="contained"
          sx={{
            color: "white",
            background: theme.palette.error.main,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography mr="0.5rem">Delete</Typography>
          <DeleteOutlinedIcon />
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            marginLeft: "1rem",
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFamily;
