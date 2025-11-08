import React, { useState } from "react";
import { Box, Typography, TextField, Button, Autocomplete, useTheme } from "@mui/material";

function AddMaintenance({ onAdd, user }) {
  const theme = useTheme();
  const [serviceType, setServiceType] = useState("");
  const [mileage, setMileage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const maintenanceOptions = [
    "Oil Change", "Brake Pads", "Tire Rotation", "Battery Replacement",
    "Spark Plugs", "Coolant Flush", "Transmission Fluid", "Cabin Air Filter",
    "Inspection", "Alignment", "Tire Change", "Power Steering Fluid", "Serpentine Belt",
    "Wiper Blades", "Brake Fluid", "Engine Replacement", "Transmission Replacement",
    "Brake Caliper Replacement", "Strut Replacement", "Wheel Balance",
    "Alternator Replacement", "Engine Air Filter Replacement",
    "Headlight Bulb Replacement", "Windshield Crack Repair", "Windshield Replacement"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const token = await user.getIdToken();

    try {
      const response = await fetch("https://autologg.onrender.com/add_record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          serviceType,
          mileage,
          date,
        }),
      });

      if (!response.ok) throw new Error("Failed to add record");
      const saved = await response.json();
      onAdd(saved);

      setServiceType("");
      setMileage("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Error submitting record:", err);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "600px",
        margin: "auto",
        marginTop: "20px",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: theme.palette.background.paper,
        boxShadow: 3,
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Add Maintenance Record
      </Typography>
      <form onSubmit={handleSubmit}>
        <Autocomplete
          freeSolo
          fullWidth
          options={maintenanceOptions}
          value={serviceType}
          onChange={(e, value) => setServiceType(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Service Type"
              required
              margin="normal"
              fullWidth
            />
          )}
        />
        <TextField
          fullWidth
          label="Mileage"
          type="number"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          inputProps={{ min: 0, max: 1000000 }}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: new Date().toISOString().split("T")[0] }}
          required
          margin="normal"
        />
        <Button fullWidth type="submit" variant="contained" color="primary" sx={{ marginTop: "16px" }}>
          Add Record
        </Button>
      </form>
    </Box>
  );
}

export default AddMaintenance;
