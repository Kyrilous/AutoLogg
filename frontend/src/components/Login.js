import React from "react";
import { signInWithPopup } from "firebase/auth";
import {
  Container,
  Paper,
  Typography,
  Button,
  Avatar,
  CssBaseline,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import { useTheme } from "@mui/material/styles";

function Login({ onLogin }) {
  const theme = useTheme();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const [typedText, setTypedText] = useState("");
  const fullText = "Welcome to AutoLog";

  useEffect(() => {
    const delay = setTimeout(() => {
      const typingInterval = setInterval(() => {
        setTypedText((prev) => {
          if (prev.length < fullText.length) {
            return fullText.slice(0, prev.length + 1);
          } else {
            clearInterval(typingInterval);
            return prev;
          }
        });
      }, 100); // typing speed
    }, 100); // small initial delay
  
    return () => clearTimeout(delay);
  }, []);
  


  return (
    <>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
              margin: "0 auto 16px auto",
              fontSize: "1.5rem",
            }}
          >
            🚗
          </Avatar>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ minHeight: "2.5rem" }}  // prevents layout shift
          >
            {typedText}
          </Typography>


          <Button
            onClick={handleGoogleSignIn}
            variant="contained"
            startIcon={<GoogleIcon />}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Container>
    </>
  );
}

export default Login;
