import React from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logActivity } from "services/activityLogService";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  birthDate: Yup.date()
    .required("Birth date is required")
    .max(new Date(), "Birth date cannot be in the future"),
  phone: Yup.string()
    .matches(/^09\d{9}$/, "Phone number must start with 09 and be 11 digits")
    .required("Phone number is required"),
  gender: Yup.string().required("Gender is required").oneOf(["Male", "Female"]),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Single", "Married", "Widowed"]),
});

const AddMember = ({ open, familyId, onClose, onRefresh }) => {
  const initialValues = {
    name: "",
    age: "",
    gender: "Male",
    status: "Single",
    birthDate: "",
    phone: "",
  };

  const calculateAge = (birthDate) => {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
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

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!familyId) {
      toast.error("Family ID is missing.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:7777/familyMembers", {
        ...values,
        familyId,
        age: calculateAge(values.birthDate),
      });

      if (response.status === 201) {
        // Log activity
        await logActivity(
          "ADD_FAMILY_MEMBER",
          `Added new member: ${values.name} (ID: ${response.data.id}) to Family ID: ${familyId}`
        );

        onRefresh();
        toast.success("Member added successfully!");
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Error adding member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Member</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <Field
                as={TextField}
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                error={touched.name && errors.name}
                helperText={touched.name && errors.name}
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                label="Birth Date"
                name="birthDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={touched.birthDate && errors.birthDate}
                helperText={touched.birthDate && errors.birthDate}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Age"
                value={values.birthDate ? calculateAge(values.birthDate) : ""}
                disabled
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

              <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  Add Member
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
      <ToastContainer />
    </Dialog>
  );
};

export default AddMember;
