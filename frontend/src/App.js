import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Container,
  Box, CssBaseline, ThemeProvider, createTheme
} from "@mui/material";
import Dashboard from "./pages/Dashboard";
import Metrics from "./pages/Metrics";
import Deployments from "./pages/Deployments";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    background: { default: "#0a1929", paper: "#001e3c" },
  },
  typography: { fontFamily: "Inter, Roboto, sans-serif" },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" color="primary" sx={{ mb: 3 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              SmartOps Platform
            </Typography>
            <Button color="inherit" component={Link} to="/">Pipelines</Button>
            <Button color="inherit" component={Link} to="/metrics">Metrics</Button>
            <Button color="inherit" component={Link} to="/deployments">Deployments</Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl">
          <Box sx={{ p: 2 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/deployments" element={<Deployments />} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}
