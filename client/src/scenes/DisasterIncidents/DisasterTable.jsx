import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const DisasterTable = ({ disasters, handleViewDetails, formatDate }) => {
  const [selectedType, setSelectedType] = useState("All");

  // Extract unique disaster types for the tabs
  const disasterTypes = [
    "All",
    ...new Set(disasters.map((d) => d.disasterType)),
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedType(newValue);
  };

  // Filter disasters based on the selected type
  const filteredDisasters =
    selectedType === "All"
      ? disasters
      : disasters.filter((disaster) => disaster.disasterType === selectedType);

  return (
    <Box>
      {/* Tabs for filtering disaster types */}
      <Tabs
        value={selectedType}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ marginBottom: 2 }}
      >
        {disasterTypes.map((type) => (
          <Tab key={type} label={type} value={type} />
        ))}
      </Tabs>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 400,
          borderRadius: "12px",
          overflowY: "auto",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Type
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDisasters.length > 0 ? (
              filteredDisasters.map((disaster) => (
                <TableRow key={disaster.id} hover>
                  <TableCell>{disaster.id}</TableCell>
                  <TableCell>{disaster.disasterType}</TableCell>
                  <TableCell>{formatDate(disaster.disasterDate)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#6C63FF",
                        color: "#fff",
                        marginRight: "10px",
                        "&:hover": { backgroundColor: "#5a53e0" },
                      }}
                      onClick={() => handleViewDetails(disaster)}
                    >
                      <VisibilityIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No disasters found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DisasterTable;
