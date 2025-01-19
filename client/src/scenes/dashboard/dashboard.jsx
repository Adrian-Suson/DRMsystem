import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  useTheme,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import WarningIcon from "@mui/icons-material/Warning";
import PurokTable from "./PurokTable";
import AffectedFamiliesDisasters from "./AffectedFamilies";

const Dashboard = () => {
  const [purokData, setPurokData] = useState([]);
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [totalMale, setTotalMale] = useState(0);
  const [totalFemale, setTotalFemale] = useState(0);
  const [totalAffectedFamilies, setTotalAffectedFamilies] = useState(0);
  const [selectedTable, setSelectedTable] = useState("");

  const theme = useTheme();

  useEffect(() => {
    // Fetch initial data
    const fetchPopulationData = async () => {
      try {
        const populationResponse = await axios.get(
          "http://localhost:7777/population"
        );
        const affectedFamiliesResponse = await axios.get(
          "http://localhost:7777/affectedFamilies"
        );

        // Log the population response to understand its structure
        console.log("Population response:", populationResponse.data);

        // Check if 'population' exists in the response data
        const data =
          populationResponse.data && populationResponse.data.population;
        if (!data) {
          throw new Error(
            "Population data is missing or incorrectly structured."
          );
        }

        // Set the data directly from the backend response
        setPurokData(data);

        // Calculate totals from the data
        const totalPop = data.reduce(
          (sum, purok) => sum + Number(purok.male) + Number(purok.female),
          0
        );
        const totalMales = data.reduce(
          (sum, purok) => sum + Number(purok.male),
          0
        );
        const totalFemales = data.reduce(
          (sum, purok) => sum + Number(purok.female),
          0
        );

        setTotalPopulation(totalPop);
        setTotalMale(totalMales);
        setTotalFemale(totalFemales);
        setTotalAffectedFamilies(affectedFamiliesResponse.data.total);
      } catch (error) {
        console.error("Error fetching population data:", error.message);
      }
    };

    fetchPopulationData();

    // Load last selected card from local storage
    const lastSelectedTable = localStorage.getItem("selectedTable");
    if (lastSelectedTable) {
      setSelectedTable(lastSelectedTable);
    }
  }, []);

  // Save selected card to local storage
  const handleCardClick = (table) => {
    setSelectedTable(table);
    localStorage.setItem("selectedTable", table);
  };

  // Map the data to fit the table structure
  const populationData = purokData.map((purok) => ({
    purok: purok.purok,
    value: Number(purok.male) + Number(purok.female),
  }));

  const maleData = purokData.map((purok) => ({
    purok: purok.purok,
    value: purok.male,
  }));

  const femaleData = purokData.map((purok) => ({
    purok: purok.purok,
    value: purok.female,
  }));

  return (
    <Box p={2} sx={{ height: "100vh", overflow: "auto" }}>
      {" "}
      {/* Scrollable container */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: theme.palette.primary.dark }}
      >
        Welcome to the Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{ borderRadius: 2, padding: 1 }}
            onClick={() => handleCardClick("population")}
            style={{ cursor: "pointer" }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  mr: 1,
                  width: 40,
                  height: 40,
                }}
              >
                <PeopleIcon fontSize="medium" />
              </Avatar>
              <Box>
                <Typography variant="body1" color="textSecondary">
                  Total Population
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {totalPopulation}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{ borderRadius: 2, padding: 1 }}
            onClick={() => handleCardClick("male")}
            style={{ cursor: "pointer" }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  backgroundColor: theme.palette.info.main,
                  mr: 1,
                  width: 40,
                  height: 40,
                }}
              >
                <MaleIcon fontSize="medium" />
              </Avatar>
              <Box>
                <Typography variant="body1" color="textSecondary">
                  Males
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {totalMale}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{ borderRadius: 2, padding: 1 }}
            onClick={() => handleCardClick("female")}
            style={{ cursor: "pointer" }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  backgroundColor: theme.palette.error.main,
                  mr: 1,
                  width: 40,
                  height: 40,
                }}
              >
                <FemaleIcon fontSize="medium" />
              </Avatar>
              <Box>
                <Typography variant="body1" color="textSecondary">
                  Females
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {totalFemale}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            elevation={3}
            sx={{ borderRadius: 2, padding: 1 }}
            onClick={() => handleCardClick("affected")}
            style={{ cursor: "pointer" }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  backgroundColor: theme.palette.warning.main,
                  mr: 1,
                  width: 40,
                  height: 40,
                }}
              >
                <WarningIcon fontSize="medium" />
              </Avatar>
              <Box>
                <Typography variant="body1" color="textSecondary">
                  Affected Families
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {totalAffectedFamilies}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ marginTop: 1 }}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", color: theme.palette.primary.dark }}
          >
            {selectedTable === "population" && "Purok Population Information"}
            {selectedTable === "male" && "Purok Male Information"}
            {selectedTable === "female" && "Purok Female Information"}
            {selectedTable === "affected" && " Affected Families by Disaster"}
          </Typography>

          {/* Scrollable Section */}
          <Box sx={{ maxHeight: 350, overflow: "auto", p: 1.5 }}>
            {selectedTable === "population" && (
              <PurokTable data={populationData} title="Total Population" />
            )}
            {selectedTable === "male" && (
              <PurokTable data={maleData} title="Males" />
            )}
            {selectedTable === "female" && (
              <PurokTable data={femaleData} title="Females" />
            )}
            {selectedTable === "affected" && <AffectedFamiliesDisasters />}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
