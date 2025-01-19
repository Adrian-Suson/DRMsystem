import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Card,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DisasterTable from "./DisasterTable";
import { logActivity } from "services/activityLogService";

const DisasterIncidents = () => {
  const [disasters, setDisasters] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [disasterType, setDisasterType] = useState("");
  const [disasterDate, setDisasterDate] = useState("");
  const [selectedDisaster, setSelectedDisaster] = useState(null);

  const disasterTypes = [
    "Flood",
    "Earthquake",
    "Typhoon",
    "Fire",
    "Landslide",
    "Drought",
    "Tsunami",
  ];

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await axios.get("http://localhost:7777/disasters");
      if (response.status === 200) {
        setDisasters(response.data.reverse());
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error fetching disasters:", error);
      toast.error("Error fetching disasters.");
    }
  };

  const handleAddDisaster = async () => {
    if (!disasterType || !disasterDate) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:7777/disasters", {
        disasterType,
        disasterDate,
      });

      if (response.status === 201) {
        // Log the activity
        await logActivity(
          "ADD_DISASTER",
          `Added new disaster incident: ${disasterType} (ID: ${response.data.id}) on ${disasterDate}`
        );

        toast.success("Disaster added successfully!");
        fetchDisasters();
        setDialogOpen(false);
        setDisasterType("");
        setDisasterDate("");
      } else {
        throw new Error("Failed to add disaster.");
      }
    } catch (error) {
      console.error("Error adding disaster:", error);
      toast.error("Error adding disaster.");
    }
  };

  const handleViewDetails = async (disaster) => {
    try {
      const [countResponse, familiesResponse] = await Promise.all([
        axios.get(
          `http://localhost:7777/affectedFamilies/count/${disaster.id}`
        ),
        axios.get(
          `http://localhost:7777/affectedFamilies/details/${disaster.id}`
        ),
      ]);

      if (countResponse.status === 200 && familiesResponse.status === 200) {
        const affectedFamilies = familiesResponse.data;

        console.log("countResponse:", countResponse);

        // Set selected disaster details with the structured data from countResponse
        setSelectedDisaster({
          ...disaster,
          familyCount: countResponse.data.familyCount,
          totalMaleMembers: countResponse.data.totalMaleMembers,
          totalFemaleMembers: countResponse.data.totalFemaleMembers,
          summary: countResponse.data.summary,
          affectedFamilies: affectedFamilies.affectedFamilies,
        });

        setDetailDialogOpen(true);
      } else {
        throw new Error("Failed to fetch disaster details.");
      }
    } catch (error) {
      console.error("Error fetching disaster details:", error);
      toast.error("Error fetching disaster details.");
    }
  };

  const handlePrint = async () => {
    if (!selectedDisaster) return;

    try {
      // Log print activity
      await logActivity(
        "PRINT_DISASTER_REPORT",
        `Generated report for disaster: ${selectedDisaster.disasterType} (ID: ${
          selectedDisaster.id
        }) 
         Date: ${formatDate(selectedDisaster.disasterDate)}
         Affected Families: ${selectedDisaster.affectedFamilies.length}
         Total Males: ${selectedDisaster.totalMaleMembers}
         Total Females: ${selectedDisaster.totalFemaleMembers}`
      );

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
      <html>
        <head>
          <title>Disaster Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Disaster Details</h1>
          <h2>${selectedDisaster.disasterType} on ${formatDate(
        selectedDisaster.disasterDate
      )}</h2>
          <p>Total Affected Families: ${
            selectedDisaster.affectedFamilies.length
          }</p>
          <p>Total Male Members: ${selectedDisaster.totalMaleMembers}</p>
          <p>Total Female Members: ${selectedDisaster.totalFemaleMembers}</p>
          <h3>Summary</h3>
          <table>
            <tr>
              <th>Category</th>
              <th>Males</th>
              <th>Females</th>
            </tr>
            ${Object.entries(selectedDisaster.summary)
              .map(
                ([key, value]) => `
                <tr>
                  <td>${key}</td>
                  <td>${value.males}</td>
                  <td>${value.females}</td>
                </tr>`
              )
              .join("")}
          </table>
          <h3>Affected Families</h3>
          ${selectedDisaster.affectedFamilies
            .map(
              (family) => `
            <h4>Family ID ${family.familyId}</h4>
            <table>
              <tr>
                <th>Representative</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Birth Date</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Purok</th>
                <th>Residency Type</th>
              </tr>
              <tr>
                <td>${family.representative}</td>
                <td>${family.age}</td>
                <td>${family.gender}</td>
                <td>${new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(family.birthDate))}</td>
                <td>${family.status}</td>
                <td>${family.phone}</td>
                <td>${family.purok || "N/A"}</td>
                <td>
                  ${family.residencyType} 
                  ${
                    family.residencyType === "Boarder" &&
                    ` (${family.ownerName})`
                  }
                </td>
              </tr>
              <tr><td colspan="7"><strong>Members:</strong></td></tr>
              ${family.members
                .map(
                  (member) => `
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Birth Date</th>
                <th>Status</th>
                <th>Phone</th>
              </tr>
                <tr>
                  <td>${member.name}</td>
                  <td>${member.age}</td>
                  <td>${member.gender}</td>
                  <td>${new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(member.birthDate))}</td>
                  <td>${member.status}</td>
                  <td>${member.phone}</td>
                </tr>
              `
                )
                .join("")}
            </table>
          `
            )
            .join("")}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error logging print activity:", error);
      toast.error("Error generating report");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <Box style={{ height: "100%", width: "100%", padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Disaster Incidents Management
      </Typography>
      <Grid container justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: "#6C63FF",
            color: "#fff",
            borderRadius: "20px",
            padding: "10px 20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor: "#5a53e0",
            },
          }}
          onClick={() => setDialogOpen(true)}
        >
          Add Disaster
        </Button>
      </Grid>

      <DisasterTable
        disasters={disasters}
        handleViewDetails={handleViewDetails}
        formatDate={formatDate}
      />

      <ToastContainer />

      {/* Add Disaster Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Disaster</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Disaster Type</InputLabel>
            <Select
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value)}
              required
            >
              {disasterTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Disaster Date"
            type="date"
            fullWidth
            value={disasterDate}
            onChange={(e) => setDisasterDate(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDisaster} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          margin: 0,
          zIndex: 1300,
        }}
      >
        <DialogTitle>Disaster Details</DialogTitle>
        <DialogContent>
          {selectedDisaster && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedDisaster.disasterType} on{" "}
                {formatDate(selectedDisaster.disasterDate)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total Affected Families:{" "}
                {selectedDisaster.affectedFamilies.length}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total Male Members: {selectedDisaster.totalMaleMembers}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total Female Members: {selectedDisaster.totalFemaleMembers}
              </Typography>

              {selectedDisaster.summary && (
                <Box mt={2}>
                  <Typography variant="h6">Summary</Typography>
                  <Card variant="outlined" sx={{ marginTop: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell>Males</TableCell>
                          <TableCell>Females</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {["children", "teens", "adults", "seniors"].map(
                          (category) => (
                            <TableRow key={category}>
                              <TableCell>
                                {category.charAt(0).toUpperCase() +
                                  category.slice(1)}
                              </TableCell>
                              <TableCell>
                                {selectedDisaster.summary[category]?.males || 0}
                              </TableCell>
                              <TableCell>
                                {selectedDisaster.summary[category]?.females ||
                                  0}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </Box>
              )}

              <Box mt={2}>
                <Typography variant="h6">Affected Families</Typography>
                {selectedDisaster.affectedFamilies.map((family) => (
                  <Card
                    key={family.familyId}
                    variant="outlined"
                    sx={{ marginBottom: 2, padding: 2 }}
                  >
                    <Typography variant="h6">
                      Family ID {family.familyId}:
                    </Typography>

                    {/* Representative Table */}
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Representative</TableCell>
                          <TableCell>Age</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>Birth Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Purok</TableCell>
                          <TableCell>Residency Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{family.representative}</TableCell>
                          <TableCell>{family.age}</TableCell>
                          <TableCell>{family.gender}</TableCell>
                          <TableCell>
                            {new Intl.DateTimeFormat("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(family.birthDate))}
                          </TableCell>
                          <TableCell>{family.status}</TableCell>
                          <TableCell>{family.phone}</TableCell>
                          <TableCell>{family.purok || "N/A"}</TableCell>
                          <TableCell>
                            {family.residencyType}
                            {family.residencyType === "Boarder" &&
                              ` (${family.ownerName})`}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Members Table */}
                    <Typography variant="h7" mt={2}>
                      Members of Family ID {family.familyId}:
                    </Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Member ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Age</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>Birth Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Phone</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {family.members.map((member) => (
                          <TableRow key={member.memberId}>
                            <TableCell>{member.memberId}</TableCell>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.age}</TableCell>
                            <TableCell>{member.gender}</TableCell>
                            <TableCell>
                              {new Intl.DateTimeFormat("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(member.birthDate))}
                            </TableCell>
                            <TableCell>{member.status}</TableCell>
                            <TableCell>{member.phone}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#6C63FF",
              color: "#fff",
              marginRight: "10px",
              "&:hover": { backgroundColor: "#5a53e0" },
            }}
            onClick={handlePrint}
            color="primary"
          >
            Print
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FF6B6B",
              color: "#fff",
              marginRight: "10px",
            }}
            onClick={() => setDetailDialogOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DisasterIncidents;
