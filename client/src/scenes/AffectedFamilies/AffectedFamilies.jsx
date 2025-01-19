import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Autocomplete,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logActivity } from "services/activityLogService";

const AffectedFamilies = () => {
  const [familyId, setFamilyId] = useState("");
  const [disasterId, setDisasterId] = useState("");
  const [families, setFamilies] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [affectedFamilies, setAffectedFamilies] = useState([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("All");

  const fetchAffectedFamilies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:7777/families_with_disasters"
      );
      if (response.status === 200) {
        setAffectedFamilies(response.data.reverse());
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error fetching affected families.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await axios.get("http://localhost:7777/families");
      if (response.status === 200) {
        setFamilies(response.data);
      }
    } catch (error) {
      toast.error("Error fetching families.");
    }
  };

  const fetchDisasters = async () => {
    try {
      const response = await axios.get("http://localhost:7777/disasters");
      if (response.status === 200) {
        setDisasters(response.data.reverse());
      }
    } catch (error) {
      toast.error("Error fetching disasters.");
    }
  };

  const fetchFamilyMembers = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:7777/families-with-members/${id}`
      );
      if (response.status === 200) {
        setFamilyMembers(response.data);
        setMembersDialogOpen(true);
      }
    } catch (error) {
      toast.error("Error fetching family members.");
    }
  };

  const handleLinkFamilyToDisaster = async () => {
    if (!familyId || !disasterId) {
      toast.error("Family and Disaster must be selected.");
      return;
    }

    const isAlreadyLinked = affectedFamilies.some(
      (entry) => entry.familyId === familyId && entry.disasterId === disasterId
    );

    if (isAlreadyLinked) {
      toast.error("This family is already linked to the selected disaster.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:7777/affected_family",
        { familyId, disasterId }
      );
      if (response.status === 201) {
        toast.success("Family linked to disaster successfully!");
        await logActivity(
          "LINK_FAMILY_TO_DISASTER",
          `Linked family ID: ${familyId} to disaster ID: ${disasterId}`
        );
        fetchAffectedFamilies();
        handleFormDialogClose();
      } else {
        toast.error("Failed to link family to disaster.");
      }
    } catch (error) {
      toast.error("Error linking family to disaster.");
    } finally {
      setFamilyId("");
      setDisasterId("");
    }
  };

  const handleFormDialogClose = () => {
    setFormDialogOpen(false);
    setFamilyId("");
    setDisasterId("");
  };

  const handleMembersDialogClose = () => {
    setMembersDialogOpen(false);
    setFamilyMembers([]);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter families by selected disaster type
  const filteredFamilies =
    selectedType === "All"
      ? affectedFamilies
      : affectedFamilies.filter(
          (family) => family.disasterType === selectedType
        );

  // Disaster types for tabs
  const disasterTypes = [
    "All",
    ...new Set(affectedFamilies.map((entry) => entry.disasterType)),
  ];

  useEffect(() => {
    fetchAffectedFamilies();
    fetchFamilies();
    fetchDisasters();
  }, []);

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        padding: "20px",
      }}
    >
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setFormDialogOpen(true)}
          sx={{
            backgroundColor: "#6C63FF",
            color: "#fff",
            borderRadius: "20px",
            padding: "10px 20px",
          }}
        >
          Add Affected Family
        </Button>
      </Box>

      {/* Tabs for disaster type filtering */}
      <Tabs
        value={selectedType}
        onChange={(event, newValue) => setSelectedType(newValue)}
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
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
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
                <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                  Representative
                </TableCell>
                <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                  Disaster Type
                </TableCell>
                <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                  Disaster Date
                </TableCell>
                <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFamilies.length > 0 ? (
                filteredFamilies.map((entry) => (
                  <TableRow key={`${entry.id}-${entry.disasterId}`}>
                    <TableCell>{entry.representative}</TableCell>
                    <TableCell>{entry.disasterType}</TableCell>
                    <TableCell>{formatDate(entry.disasterDate)}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#6C63FF",
                          color: "#fff",
                          marginRight: "10px",
                          "&:hover": { backgroundColor: "#5a53e0" },
                        }}
                        onClick={() => fetchFamilyMembers(entry.familyId)}
                      >
                        <VisibilityIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No affected families found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={formDialogOpen}
        onClose={handleFormDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Link Family to Disaster</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={families}
            getOptionLabel={(option) => option.representative}
            onChange={(event, newValue) => {
              setFamilyId(newValue ? newValue.id : "");
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {" "}
                {/* Ensure unique key here */}
                {option.representative}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Family"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ borderRadius: "8px" }}
              />
            )}
          />

          <Autocomplete
            options={disasters}
            getOptionLabel={(option) =>
              `${option.disasterType} - ${formatDate(option.disasterDate)}`
            }
            onChange={(event, newValue) => {
              setDisasterId(newValue ? newValue.id : "");
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {" "}
                {/* Ensure unique key here */}
                {`${option.disasterType} - ${formatDate(option.disasterDate)}`}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Disaster"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ borderRadius: "8px" }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormDialogClose}>Cancel</Button>
          <Button onClick={handleLinkFamilyToDisaster} color="primary">
            Link
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={membersDialogOpen}
        onClose={handleMembersDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Family Members</DialogTitle>
        <DialogContent>
          {familyMembers.length > 0 ? (
            <>
              {/* Display representative Purok */}
              <h3 style={{ textAlign: "center" }}>
                Purok: {familyMembers[0].purok}
              </h3>
              {/* Display representative Purok */}
              <h3 style={{ textAlign: "center" }}>
                Residency Type: {familyMembers[0].residencyType}
                {familyMembers[0].residencyType === "Boarder" &&
                  ` (${familyMembers[0].ownerName})`}
              </h3>

              {/* Display representative details in a table format */}
              <h3>Representative Details</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Name:</strong> {familyMembers[0].representative}
                    </TableCell>
                    <TableCell>
                      <strong>Age:</strong> {familyMembers[0].family_age}
                    </TableCell>
                    <TableCell>
                      <strong>Gender:</strong> {familyMembers[0].family_gender}
                    </TableCell>
                    <TableCell>
                      <strong>Status:</strong> {familyMembers[0].family_status}
                    </TableCell>
                    <TableCell>
                      <strong>Phone:</strong> {familyMembers[0].family_phone}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Members table */}
              <h3>Members:</h3>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Age</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Gender</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Phone</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {familyMembers.map((member) => (
                    <TableRow key={member.member_id}>
                      <TableCell>{member.member_name}</TableCell>
                      <TableCell>{member.member_age}</TableCell>
                      <TableCell>{member.member_gender}</TableCell>
                      <TableCell>{member.member_status}</TableCell>
                      <TableCell>{member.member_phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div>No members found for this family.</div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FF6B6B",
              color: "#fff",
              marginRight: "10px",
            }}
            onClick={handleMembersDialogClose}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default AffectedFamilies;
