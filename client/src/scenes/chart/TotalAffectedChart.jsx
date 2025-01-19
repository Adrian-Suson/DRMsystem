import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TotalAffectedChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const updateChartData = useCallback(
    (data, affectedData) => {
      const filteredData = data.filter((item) => {
        const itemDate = new Date(item.disasterDate);
        const isTypeMatch = selectedType
          ? item.disasterType === selectedType
          : true;

        if (dateFilterType === "year" && selectedDate) {
          return (
            isTypeMatch && itemDate.getFullYear() === selectedDate.getFullYear()
          );
        } else if (dateFilterType === "month" && selectedDate) {
          return (
            isTypeMatch &&
            itemDate.getFullYear() === selectedDate.getFullYear() &&
            itemDate.getMonth() === selectedDate.getMonth()
          );
        } else if (dateFilterType === "day" && selectedDate) {
          return (
            isTypeMatch &&
            itemDate.toDateString() === selectedDate.toDateString()
          );
        } else if (dateFilterType === "range" && startDate && endDate) {
          return isTypeMatch && itemDate >= startDate && itemDate <= endDate;
        }
        return isTypeMatch;
      });

      const labels = [
        ...new Set(filteredData.map((item) => item.disasterType)),
      ];

      const disasterCountData = labels.map((label) => {
        return filteredData.filter((item) => item.disasterType === label)
          .length; // Count of disasters
      });

      const affectedCounts = labels.map((label) => {
        const totalAffected = affectedData.find(
          (item) => item.disasterType === label
        );
        return totalAffected ? totalAffected.total : 0; // Affected families count
      });

      const datasets = [
        {
          label: "Disaster Count",
          data: disasterCountData.length > 0 ? disasterCountData : [0],
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Total Affected Families",
          data: affectedCounts.length > 0 ? affectedCounts : [0],
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ];

      setChartData({
        labels: labels.length > 0 ? labels : ["No Data"],
        datasets: datasets,
      });
      setIsLoading(false);
    },
    [selectedType, dateFilterType, selectedDate, startDate, endDate]
  );

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [disasterResponse, affectedResponse] = await Promise.all([
          axios.get("http://localhost:7777/disasters/count"),
          axios.get("http://localhost:7777/affectedFamiliesByType"),
        ]);

        const data = disasterResponse.data;
        const affectedData = affectedResponse.data;

        const uniqueDisasters = [
          ...new Set(data.map((item) => item.disasterType)),
        ];
        setDisasterTypes(uniqueDisasters);

        updateChartData(data, affectedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [updateChartData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "disasterType") {
      setSelectedType(value);
    } else if (name === "dateFilterType") {
      setDateFilterType(value);
      setSelectedDate(null);
      setStartDate(null);
      setEndDate(null);
    }
    updateChartData(chartData.datasets[0]?.data);
  };

  return (
    <Box sx={{ padding: 3, borderRadius: "12px" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 2 }}>
        <FormControl sx={{ width: 200 }}>
          <Select
            name="disasterType"
            value={selectedType}
            onChange={handleFilterChange}
            displayEmpty
            sx={{ borderRadius: "12px" }}
          >
            <MenuItem value="">
              <em>All Disasters</em>
            </MenuItem>
            {disasterTypes.map((type, index) => (
              <MenuItem key={`${type}-${index}`} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: 200 }}>
          <Select
            name="dateFilterType"
            value={dateFilterType}
            onChange={handleFilterChange}
            displayEmpty
            sx={{ borderRadius: "12px" }}
          >
            <MenuItem value="">
              <em>Select Date Filter</em>
            </MenuItem>
            <MenuItem value="year">By Year</MenuItem>
            <MenuItem value="month">By Month</MenuItem>
            <MenuItem value="day">By Day</MenuItem>
            <MenuItem value="range">By Range</MenuItem>
          </Select>
        </FormControl>
        {dateFilterType && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {dateFilterType === "year" && (
              <DatePicker
                label="Year"
                views={["year"]}
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  updateChartData(chartData.datasets[0]?.data);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ width: 150, borderRadius: "12px" }}
                  />
                )}
              />
            )}
            {dateFilterType === "month" && (
              <DatePicker
                label="Month"
                views={["year", "month"]}
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  updateChartData(chartData.datasets[0]?.data);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ width: 150, borderRadius: "12px" }}
                  />
                )}
              />
            )}
            {dateFilterType === "day" && (
              <DatePicker
                label="Day"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  updateChartData(chartData.datasets[0]?.data);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ width: 150, borderRadius: "12px" }}
                  />
                )}
              />
            )}
            {dateFilterType === "range" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                    updateChartData(chartData.datasets[0]?.data);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ width: 150, borderRadius: "12px" }}
                    />
                  )}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                    updateChartData(chartData.datasets[0]?.data);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ width: 150, borderRadius: "12px" }}
                    />
                  )}
                />
              </Box>
            )}
          </LocalizationProvider>
        )}
      </Box>

      {isLoading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <Box
          sx={{
            height: 400,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Bar
            data={chartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  ticks: {
                    stepSize: 1,
                    callback: function (value) {
                      return Number.isInteger(value) ? value : null;
                    },
                  },
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Disaster Count and Total Affected Families by Disaster Type",
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default TotalAffectedChart;
