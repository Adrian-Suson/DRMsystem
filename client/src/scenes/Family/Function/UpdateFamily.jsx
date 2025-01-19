import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { logActivity } from "services/activityLogService";

const validationSchema = Yup.object().shape({
  representative: Yup.string()
    .required("Representative name is required")
    .min(2, "Name must be at least 2 characters"),
  purok: Yup.string().required("Purok is required"),
  gender: Yup.string().required("Gender is required"),
  status: Yup.string().required("Status is required"),
  birthDate: Yup.date()
    .required("Birth date is required")
    .max(new Date(), "Birth date cannot be in the future"),
  phone: Yup.string()
    .matches(/^09\d{9}$/, "Phone number must start with 09 and be 11 digits")
    .required("Phone number is required"),
});

const UpdateFamily = ({ open, familyId, onClose, onUpdate }) => {
  const [initialValues, setInitialValues] = useState({
    representative: "",
    purok: "",
    gender: "",
    status: "",
    birthDate: "",
    phone: "",
  });
  const theme = useTheme();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState("success");

  useEffect(() => {
    if (familyId && open) {
      const fetchFamilyDetails = async () => {
        try {
          const response = await fetch(
            `http://localhost:7777/families/${familyId}`
          );
          if (response.ok) {
            const data = await response.json();
            setInitialValues({
              representative: data.representative || "",
              purok: data.purok || "",
              gender: data.gender || "",
              status: data.status || "",
              birthDate: data.birthDate.split("T")[0] || "",
              phone: data.phone || "",
            });
          } else {
            throw new Error("Failed to fetch family details.");
          }
        } catch (error) {
          console.error(error);
          setNotificationMessage("Error fetching family details.");
          setNotificationSeverity("error");
          setNotificationOpen(true);
        }
      };
      fetchFamilyDetails();
    }
  }, [familyId, open]);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleUpdate = async (values, { setSubmitting }) => {
    try {
      const updatedFamily = {
        ...values,
        age: calculateAge(values.birthDate),
      };

      const response = await fetch(
        `http://localhost:7777/families/${familyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFamily),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the family.");
      }

      // Log the update activity with detailed information
      await logActivity(
        "UPDATE_FAMILY",
        `Updated family member: ${values.representative} (ID: ${familyId}),
         Purok: ${values.purok},
         Gender: ${values.gender},
         Status: ${values.status},
         Birth Date: ${values.birthDate},
         Phone: ${values.phone}`
      );

      setNotificationMessage("Update successful!");
      setNotificationSeverity("success");
      setNotificationOpen(true);

      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error(`Error updating family with ID ${familyId}:`, error);
      setNotificationMessage("Error updating family. Please try again.");
      setNotificationSeverity("error");
      setNotificationOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Family</DialogTitle>
      <DialogContent>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleUpdate}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="representative"
                label="Representative Name"
                error={touched.representative && errors.representative}
                helperText={touched.representative && errors.representative}
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="purok"
                label="Purok"
                error={touched.purok && errors.purok}
                helperText={touched.purok && errors.purok}
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="birthDate"
                label="Birth Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={touched.birthDate && errors.birthDate}
                helperText={touched.birthDate && errors.birthDate}
              />

              <Field name="phone">
                {({ field, form }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="Phone Number"
                    error={touched.phone && errors.phone}
                    helperText={touched.phone && errors.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty input or numbers starting with 09
                      if (!value || /^(09)?\d*$/.test(value)) {
                        if (value.length <= 11) {
                          form.setFieldValue("phone", value);
                        }
                      }
                    }}
                    inputProps={{
                      maxLength: 11,
                      placeholder: "09XXXXXXXXX",
                    }}
                  />
                )}
              </Field>

              <Box margin="normal">
                <Typography>Gender</Typography>
                <Field as={RadioGroup} row name="gender">
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                  />
                </Field>
                {touched.gender && errors.gender && (
                  <Typography color="error">{errors.gender}</Typography>
                )}
              </Box>

              <Box margin="normal">
                <Typography>Status</Typography>
                <Field as={RadioGroup} row name="status">
                  <FormControlLabel
                    value="Single"
                    control={<Radio />}
                    label="Single"
                  />
                  <FormControlLabel
                    value="Married"
                    control={<Radio />}
                    label="Married"
                  />
                  <FormControlLabel
                    value="Widowed"
                    control={<Radio />}
                    label="Widowed"
                  />
                </Field>
                {touched.status && errors.status && (
                  <Typography color="error">{errors.status}</Typography>
                )}
              </Box>

              <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                <Button onClick={onClose} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" color="primary" variant="contained">
                  Update
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </DialogContent>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={() => setNotificationOpen(false)}
      >
        <Alert
          onClose={() => setNotificationOpen(false)}
          severity={notificationSeverity}
          sx={{
            backgroundColor:
              notificationSeverity === "error"
                ? theme.palette.error.main
                : theme.palette.success.main,
            color: "#fff",
          }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default UpdateFamily;
