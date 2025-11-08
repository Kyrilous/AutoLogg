import React, { useEffect, useState, useContext } from "react";
import { CssBaseline, Box, Button, Typography, Switch, FormControlLabel, ThemeProvider, GlobalStyles } from "@mui/material";
import AddMaintenance from "./components/AddMaintenance";
import MaintenanceList from "./components/MaintenanceList";
import Login from "./components/Login";

import { auth } from "./firebase";
import { ThemeToggleContext, darkTheme, lightTheme } from "./ThemeContext";

function App() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const { mode, setMode } = useContext(ThemeToggleContext);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  const handleAddRecord = async (record) => {
    try {
      const token = await user.getIdToken();
  
      const response = await fetch('http://127.0.0.1:5000/add_record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...record,
          user_id: user.uid,
        }),
      });
  
      if (!response.ok) throw new Error('Failed to add record');
  
      // ✅ Parse the saved record returned from backend
      const savedRecord = await response.json();
  
      // ✅ Append the new record (with real ID) to the records list
      setRecords((prev) => [savedRecord, ...prev]); // puts on top
  
    } catch (error) {
      console.error('Add record error:', error);
    }
  };
  
  
  
  

  const handleDeleteRecord = async (id) => {
  try {
    const token = await user.getIdToken();
    const response = await fetch(`http://127.0.0.1:5000/records/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete record");

    setRecords((prev) => prev.filter((record) => record.id !== id));
  } catch (error) {
    console.error("Delete error:", error);
  }
};


  const fetchRecords = async (user) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://127.0.0.1:5000/records?user_id=${user.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch records");

      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        fetchRecords(user);
      } else {
        setUser(null);
        setRecords([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) setMode(savedMode);
  }, [setMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            backgroundColor: theme.palette.background.default,
          },
          "#root": {
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
          },
        }}
      />
      <Box sx={{ p: 2, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
        <Typography variant="h4" align="center" fontWeight="bold" sx={{ color: theme.palette.primary.main, mb: 3 }}>
          🚗 AutoLog
        </Typography>

        {user ? (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: theme.palette.background.paper, // Reads from theme
                padding: "1rem 1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              {/* <Typography variant="title" fontWeight="750" sx={{fontFamily: "'Poppins', san-serif"}}>
                Hello, {user.displayName?.split(" ")[0] || "there"}
              </Typography> */}

              <Typography
                sx={{
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  letterSpacing: "0.7px",
                }}
              >
                Hello, {user.displayName?.split(" ")[0] || "there"}
              </Typography>


              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === "dark"}
                      onChange={() =>
                        setMode((prev) => {
                          const next = prev === "light" ? "dark" : "light";
                          localStorage.setItem("themeMode", next);
                          return next;
                        })
                      }
                      color="primary"
                    />
                  }
                  label={mode === "dark" ? "Dark" : "Light"}
                />
                <Button variant="outlined" color="error" onClick={() => auth.signOut()}>
                  Logout
                </Button>
              </Box>
            </Box>

            <AddMaintenance user={user} user_id={user.uid} onAdd={handleAddRecord} />
            <MaintenanceList records={records} user_id={user.uid} onDelete={handleDeleteRecord} newlyAddedId={newlyAddedId} />
          </>
        ) : (
          <Login onLogin={setUser} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
