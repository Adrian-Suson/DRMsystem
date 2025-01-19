import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

const ActivityLogDialog = ({ open, onClose }) => {
  const [activityLogs, setActivityLogs] = useState([]);
  const userId = localStorage.getItem("id");

  useEffect(() => {
    if (open) {
      const fetchActivityLogs = async () => {
        try {
          console.log(`Fetching activity logs for user ID: ${userId}`);
          const response = await axios.get(`http://localhost:7777/activity-logs/${userId}`);
          console.log('Response data:', response.data);
          setActivityLogs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error("Error fetching activity logs:", error);
          setActivityLogs([]);
        }
      };

      fetchActivityLogs();
    }
  }, [open, userId]);

  useEffect(() => {
    console.log('Activity logs state updated:', activityLogs);
  }, [activityLogs]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Activity Log</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.activity_type}</TableCell>
                <TableCell>{log.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityLogDialog;