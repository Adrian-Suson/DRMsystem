import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { FaFireAlt, FaSun } from "react-icons/fa";
import { FaHouseFloodWater, FaHouseTsunami } from "react-icons/fa6";
import { GiEntangledTyphoon } from "react-icons/gi";
import { MdLandslide } from "react-icons/md";
import { RiEarthquakeFill } from "react-icons/ri";

const disasterTypes = [
  { name: "Flood", icon: <FaHouseFloodWater size={24} color="#00aaff" /> },
  { name: "Earthquake", icon: <RiEarthquakeFill size={24} color="#ff7043" /> },
  { name: "Typhoon", icon: <GiEntangledTyphoon size={24} color="#66bb6a" /> },
  { name: "Fire", icon: <FaFireAlt size={24} color="#ff5252" /> },
  { name: "Landslide", icon: <MdLandslide size={24} color="#8d6e63" /> },
  { name: "Drought", icon: <FaSun size={24} color="#ffeb3b" /> },
  { name: "Tsunami", icon: <FaHouseTsunami size={24} color="#0277bd" /> },
];

const AffectedFamiliesDisasters = () => {
  const [affectedFamiliesByType, setAffectedFamiliesByType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAffectedFamiliesByType = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7777/affectedFamiliesByType"
        );
        setAffectedFamiliesByType(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching affected families by type:", error);
        setLoading(false);
      }
    };
    fetchAffectedFamiliesByType();
  }, []);

  const fetchDetailedData = async (disasterType) => {
    if (!disasterType) {
      console.error("fetchDetailedData error: disasterType is undefined");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:7777/affectedFamilies/count/type/${disasterType}`
      );
      if (response.status === 200) {
        setDetailedData(response.data);
      } else {
        console.error("No detailed data found for this disaster type.");
      }
    } catch (error) {
      console.error("Error fetching detailed data:", error);
    }
  };

  const getAffectedCount = (type) => {
    const found = affectedFamiliesByType.find(
      (item) => item.disasterType === type
    );
    return found ? found.total : 0;
  };

  const handleCardClick = (disasterType) => {
    if (!disasterType) {
      console.error("Error: disasterType is undefined");
      return;
    }
    setSelectedDisaster(disasterType);
    fetchDetailedData(disasterType);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDisaster(null);
    setDetailedData(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      {/* Render Disaster Cards */}
      <Grid container spacing={2}>
        {disasterTypes.map((disaster, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              elevation={3}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: 1,
                borderRadius: 2,
                cursor: "pointer",
              }}
              onClick={() => handleCardClick(disaster.name)}
            >
              <Avatar
                sx={{
                  backgroundColor: "#f5f5f5",
                  marginRight: 1,
                  width: 30,
                  height: 30,
                }}
              >
                {disaster.icon}
              </Avatar>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {disaster.name}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {getAffectedCount(disaster.name)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog with Table for Selected Disaster */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Affected Families Details for {selectedDisaster}
        </DialogTitle>
        <DialogContent>
          {detailedData ? (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Families</TableCell>
                    <TableCell colSpan={2}>
                      {detailedData.familyCount}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Male Members</TableCell>
                    <TableCell colSpan={2}>
                      {detailedData.totalMaleMembers}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Female Members</TableCell>
                    <TableCell colSpan={2}>
                      {detailedData.totalFemaleMembers}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Males</TableCell>
                    <TableCell>Females</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Children (0-12)</TableCell>
                    <TableCell>{detailedData.summary.children.males}</TableCell>
                    <TableCell>
                      {detailedData.summary.children.females}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Teens (13-19)</TableCell>
                    <TableCell>{detailedData.summary.teens.males}</TableCell>
                    <TableCell>{detailedData.summary.teens.females}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Adults (20-59)</TableCell>
                    <TableCell>{detailedData.summary.adults.males}</TableCell>
                    <TableCell>{detailedData.summary.adults.females}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Seniors (60+)</TableCell>
                    <TableCell>{detailedData.summary.seniors.males}</TableCell>
                    <TableCell>
                      {detailedData.summary.seniors.females}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Loading data...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AffectedFamiliesDisasters;
