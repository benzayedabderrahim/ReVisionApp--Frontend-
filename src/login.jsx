import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { auth, googleProvider, db, signInWithEmailAndPassword } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Link,
} from "@mui/material";
import logo from "./logo/logo.png";

const Login = () => {
  const [error, setError] = useState("");
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://127.0.0.1:8000/api/auth/";

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save user data to Firebase
      const userData = {
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        createdAt: new Date().toISOString(),
        provider: "google",
        lastLogin: new Date().toISOString()
      };

      await set(ref(db, `users/${user.uid}`), userData);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
      console.error("Google sign-in error:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update last login in Firebase
      await set(ref(db, `users/${user.uid}/lastLogin`), new Date().toISOString());
      
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDjangoLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}login/`, {
        email,
        password,
      });

      if (response.status === 200) {
        const firebaseKey = email.replace(/[.$#[\]/]/g, '-');
        await set(ref(db, `users/${firebaseKey}/lastLogin`), new Date().toISOString());
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}signup/`, {
        email,
        password,
        username: username || email.split('@')[0],
      });

      if (response.status === 201) {
        const firebaseKey = email.replace(/[.$#[\]/]/g, '-');
        const userData = {
          email,
          username: username || email.split('@')[0],
          createdAt: new Date().toISOString(),
          djangoUserId: response.data.user_id || `temp_${Date.now()}`,
          status: "active"
        };

        await set(ref(db, `users/${firebaseKey}`), userData);
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ width: "100px", marginBottom: "20px" }}
            />
            <Typography component="h1" variant="h4" sx={{ fontWeight: "bold" }}>
              Welcome to RE'VISION
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 3 }}>
              {isSignUpOpen ? "Create your account" : "Sign in to continue"}
            </Typography>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {/* Google Sign-In Button */}
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              sx={{
                mb: 2,
                padding: "10px",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              {googleLoading ? "Signing In..." : "Sign In with Google"}
            </Button>

            <Typography variant="body2" sx={{ mb: 2 }}>
              OR
            </Typography>

            {isSignUpOpen ? (
              <Box
                component="form"
                onSubmit={handleSignUp}
                sx={{ width: "100%", mt: 2 }}
              >
                <TextField
                  fullWidth
                  label="Username (optional)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 2,
                    padding: "10px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </Box>
            ) : (
              <Box
                component="form"
                onSubmit={handleFirebaseLogin} // Changed to handleFirebaseLogin
                sx={{ width: "100%", mt: 2 }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 2,
                    padding: "10px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "Logging In..." : "Login"}
                </Button>
              </Box>
            )}

            <Link
              component="button"
              variant="body2"
              onClick={() => setIsSignUpOpen(!isSignUpOpen)}
              sx={{ mt: 2 }}
            >
              {isSignUpOpen
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;