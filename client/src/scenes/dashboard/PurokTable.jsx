import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  TableContainer,
  Typography,
} from "@mui/material";

const PurokTable = ({ data, title }) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      elevation={3}
      sx={{
        maxHeight: 310,
        overflowY: "auto",
        borderRadius: 3,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: "bold",
                backgroundColor: theme.palette.primary.dark,
                color: theme.palette.common.white,
                fontSize: "16px",
              }}
            >
              <Typography variant="body1">Purok Name</Typography>
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                backgroundColor: theme.palette.primary.dark,
                color: theme.palette.common.white,
                fontSize: "16px",
              }}
            >
              <Typography variant="body1">{title}</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((purok, index) => (
            <TableRow
              key={index}
              sx={{
                backgroundColor: index % 2 === 0 ? theme.palette.grey[100] : theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <TableCell sx={{ fontSize: "15px", padding: "12px 16px" }}>
                {purok.purok}
              </TableCell>
              <TableCell sx={{ fontSize: "15px", padding: "12px 16px" }}>
                {purok.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PurokTable;
