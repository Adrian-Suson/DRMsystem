import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import { logActivity } from "services/activityLogService";

const PurokOptions = [
  "1A",
  "1B",
  "2",
  "3A",
  "3B",
  "4",
  "5A",
  "5B",
  "6A",
  "6B",
  "7A",
  "7B",
  "8A",
  "8B",
  "8C",
  "8D",
];

// Add validation schema
const validationSchema = Yup.object().shape({
  representative: Yup.string()
    .required("Representative name is required")
    .min(2, "Name must be at least 2 characters"),
  purok: Yup.string()
    .required("Purok is required")
    .oneOf(PurokOptions, "Invalid purok selection"),
  phone: Yup.string()
    .matches(/^09\d{9}$/, "Phone number must start with 09 and be 11 digits")
    .required("Phone number is required"),
  birthDate: Yup.date()
    .required("Birth date is required")
    .max(new Date(), "Birth date cannot be in the future"),
  gender: Yup.string().required("Gender is required").oneOf(["Male", "Female"]),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Single", "Married", "Widow"]),
  residencyType: Yup.string()
    .required("Residency type is required")
    .oneOf(["Resident", "Boarder"]),
  ownerName: Yup.string().when("residencyType", {
    is: (value) => value === "Boarder",
    then: (schema) => schema.required("Owner name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const AddFamily = ({ open, onClose, onFamilyAdded }) => {
  const initialValues = {
    representative: "",
    purok: "",
    age: "",
    gender: "Male",
    status: "Single",
    birthDate: "",
    phone: "",
    residencyType: "",
    ownerName: "",
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post("http://localhost:7777/families", {
        ...values,
        age: calculateAge(values.birthDate),
      });

      if (response.status === 201) {
        onFamilyAdded();
        resetForm();
        onClose();

        // Log activity using simplified function
        await logActivity(
          "ADD_FAMILY",
          `Added new family member: ${values.representative} (ID: ${response.data.id}) from Purok ${values.purok}`
        );

        toast.success("Family added successfully!");
      }
    } catch (error) {
      toast.error("Error adding new family.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography color="primary" gutterBottom>
          Add New Family
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="representative"
                      label="Representative *"
                      fullWidth
                      error={touched.representative && errors.representative}
                      helperText={
                        touched.representative && errors.representative
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      error={touched.purok && errors.purok}
                    >
                      <InputLabel>Purok *</InputLabel>
                      <Field as={Select} name="purok" label="Purok *">
                        {PurokOptions.map((purok) => (
                          <MenuItem key={purok} value={purok}>
                            {purok}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.purok && errors.purok && (
                        <Typography color="error" variant="caption">
                          {errors.purok}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="phone">
                      {({ field, form }) => (
                        <TextField
                          {...field}
                          label="Phone *"
                          fullWidth
                          error={touched.phone && errors.phone}
                          helperText={touched.phone && errors.phone}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow numbers and check pattern
                            if (value === "" || /^(09)?\d*$/.test(value)) {
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
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="birthDate"
                      label="Birth Date *"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        max: new Date().toISOString().split("T")[0], // Set max date to today
                      }}
                      error={touched.birthDate && errors.birthDate}
                      helperText={touched.birthDate && errors.birthDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue("birthDate", value);
                        setFieldValue("age", calculateAge(value));
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Age"
                      value={
                        values.birthDate ? calculateAge(values.birthDate) : ""
                      }
                      fullWidth
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography>Gender *</Typography>
                    <Field as={RadioGroup} name="gender" row>
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
                      <Typography color="error" variant="caption">
                        {errors.gender}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography>Status *</Typography>
                    <Field as={RadioGroup} name="status" row>
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
                        value="Widow"
                        control={<Radio />}
                        label="Widow"
                      />
                    </Field>
                    {touched.status && errors.status && (
                      <Typography color="error" variant="caption">
                        {errors.status}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography>Residency Type *</Typography>
                    <Field as={RadioGroup} name="residencyType" row>
                      <FormControlLabel
                        value="Resident"
                        control={<Radio />}
                        label="Resident"
                      />
                      <FormControlLabel
                        value="Boarder"
                        control={<Radio />}
                        label="Boarder"
                      />
                    </Field>
                    {touched.residencyType && errors.residencyType && (
                      <Typography color="error" variant="caption">
                        {errors.residencyType}
                      </Typography>
                    )}
                  </Grid>

                  {values.residencyType === "Boarder" && (
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="ownerName"
                        label="Owner Name *"
                        fullWidth
                        error={touched.ownerName && errors.ownerName}
                        helperText={touched.ownerName && errors.ownerName}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <DialogActions sx={{ pr: 3, pb: 3 }}>
                <Button
                  onClick={onClose}
                  variant="outlined"
                  color="secondary"
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Add
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddFamily;
