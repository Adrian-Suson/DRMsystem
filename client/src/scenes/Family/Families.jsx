import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddFamily from "./Function/AddFamily";
import FamilyUpdate from "./Function/UpdateFamily";
import DeleteFamily from "./Function/DeleteFamily";
import AddMember from "./Function/AddMember";
import FamilyMembersList from "./FamilyMembersList";

const Families = () => {
  const [familyData, setFamilyData] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormVisible, setAddFormVisible] = useState(false);
  const [isDeleteFamilyVisible, setIsDeleteFamilyVisible] = useState(false);
  const [isEditFamilyVisible, setIsEditFamilyVisible] = useState(false);
  const [isAddMemberVisible, setAddMemberVisible] = useState(false);
  const [isViewMembersVisible, setViewMembersVisible] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [search, setSearch] = useState("");

  const fetchFamilyData = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:7777/families");
      setFamilyData(response.data);
    } catch (error) {
      console.error("Error fetching family data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFamilyMembers = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:7777/familyMembers");
      setFamilyMembers(response.data);
    } catch (error) {
      console.error("Error fetching family members:", error.message);
    }
  }, []);

  useEffect(() => {
    fetchFamilyData();
    fetchFamilyMembers();
  }, [fetchFamilyData, fetchFamilyMembers]);

  const calculateTotalMembers = (familyId) => {
    return familyMembers.filter((member) => member.familyId === familyId)
      .length;
  };

  const handleAddButtonClick = () => {
    setAddFormVisible(!isAddFormVisible);
  };

  const handleAddFamilyClose = () => {
    setAddFormVisible(false);
  };

  const handleAddMemberClose = () => {
    setAddMemberVisible(false);
  };

  const handleViewMembersClose = () => {
    setViewMembersVisible(false);
  };

  const handleEditFamilyClick = (family) => {
    setSelectedFamily(family);
    setIsEditFamilyVisible(true);
  };

  const handleDeleteFamilyClick = (family) => {
    setSelectedFamily(family);
    setIsDeleteFamilyVisible(true);
  };

  const handleDeleteFamilyClose = () => {
    setIsDeleteFamilyVisible(false);
  };

  const handleEditFamilyClose = () => {
    setIsEditFamilyVisible(false);
  };

  const handleDeleteFamily = async () => {
    await fetchFamilyData();
    setIsDeleteFamilyVisible(false);
  };

  const handleUpdateFamily = async () => {
    await fetchFamilyData();
    setIsEditFamilyVisible(false);
  };

  const handleAddMemberClick = (family) => {
    setSelectedFamily(family);
    setAddMemberVisible(true);
  };

  const handleViewMembersClick = (family) => {
    setSelectedFamily(family);
    setViewMembersVisible(true);
  };

  const filteredFamilyData = familyData.filter((family) =>
    family.representative.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        padding: "20px",
      }}
    >
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={2}
            >
              <TextField
                variant="outlined"
                label="Search Families"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: "300px", borderRadius: "12px" }}
                InputProps={{
                  endAdornment: <SearchIcon />,
                }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#6C63FF",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "10px 20px",
                }}
                startIcon={<AddIcon />}
                onClick={handleAddButtonClick}
              >
                Add Family
              </Button>
            </Box>

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
                      ID
                    </TableCell>
                    <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                      Representative
                    </TableCell>
                    <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                      Purok
                    </TableCell>
                    <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                      Residency Type
                    </TableCell>
                    <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                      Phone
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#000",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Total Members
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#000",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFamilyData.map((family) => (
                    <TableRow
                      key={family.id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f1f1f1" },
                        "&:hover": { backgroundColor: "#e0e0e0" },
                        borderRadius: "12px",
                      }}
                    >
                      <TableCell>{family.id}</TableCell>
                      <TableCell>{family.representative}</TableCell>
                      <TableCell>{family.purok}</TableCell>
                      <TableCell>
                        {family.residencyType}
                        {family.residencyType === "Boarder" &&
                          ` (${family.ownerName})`}
                      </TableCell>
                      <TableCell>{family.phone}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          variant="contained"
                          sx={{
                            backgroundColor: "#6C63FF",
                            color: "#fff",
                            marginRight: "10px",
                            "&:hover": { backgroundColor: "#5a53e0" },
                          }}
                          onClick={() => handleViewMembersClick(family.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {calculateTotalMembers(family.id)}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center">
                          <IconButton
                            sx={{
                              marginRight: "10px",
                              backgroundColor: "#6C63FF",
                              color: "#fff",
                            }}
                            onClick={() => handleEditFamilyClick(family.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            sx={{ backgroundColor: "#FF6B6B", color: "#fff" }}
                            onClick={() => handleDeleteFamilyClick(family.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            sx={{
                              marginLeft: "10px",
                              backgroundColor: "#6C63FF",
                              color: "#fff",
                            }}
                            onClick={() => handleAddMemberClick(family.id)}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <AddFamily
            open={isAddFormVisible}
            onClose={handleAddFamilyClose}
            onFamilyAdded={fetchFamilyData}
          />
          <DeleteFamily
            open={isDeleteFamilyVisible}
            familyId={selectedFamily}
            onClose={handleDeleteFamilyClose}
            onDelete={handleDeleteFamily}
          />
          <FamilyUpdate
            open={isEditFamilyVisible}
            familyId={selectedFamily}
            onClose={handleEditFamilyClose}
            onUpdate={handleUpdateFamily}
          />
          <AddMember
            open={isAddMemberVisible}
            familyId={selectedFamily}
            onClose={handleAddMemberClose}
            onRefresh={fetchFamilyMembers}
          />
          <FamilyMembersList
            open={isViewMembersVisible}
            familyId={selectedFamily}
            onClose={handleViewMembersClose}
            onRefresh={fetchFamilyData}
          />
          <ToastContainer />
        </>
      )}
    </Box>
  );
};

export default Families;
