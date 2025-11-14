import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Grid, TextField, Button, Box, Chip
} from "@mui/material";
import axios from "axios";

const API_BASE = "/api";

export default function Dashboard() {
  const [pipelines, setPipelines] = useState([]);
  const [form, setForm] = useState({ name: "", jenkinsJob: "", repo: "" });

  const fetchPipelines = async () => {
    const res = await axios.get(`${API_BASE}/pipelines`);
    setPipelines(res.data);
  };

  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 10000);
    return () => clearInterval(interval);
  }, []);

  const createPipeline = async () => {
    await axios.post(`${API_BASE}/pipelines`, form);
    setForm({ name: "", jenkinsJob: "", repo: "" });
    fetchPipelines();
  };

  const triggerPipeline = async (id) => {
    await axios.post(`${API_BASE}/pipelines/${id}/trigger`);
    fetchPipelines();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Pipelines
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 4 }}>
        <TextField label="Name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <TextField label="Jenkins Job" value={form.jenkinsJob}
          onChange={e => setForm({ ...form, jenkinsJob: e.target.value })} />
        <TextField label="Repo (optional)" value={form.repo}
          onChange={e => setForm({ ...form, repo: e.target.value })} />
        <Button variant="contained" color="primary" onClick={createPipeline}>
          Create
        </Button>
      </Box>

      <Grid container spacing={3}>
        {pipelines.map(p => (
          <Grid item xs={12} md={4} key={p._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Jenkins: {p.jenkinsJob || "-"}
                </Typography>
                <Typography variant="body2">
                  Repo: {p.repo || "-"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Last Build: #{p.lastBuild?.number || "-"}
                </Typography>
                <Chip
                  label={p.lastBuild?.status || "Pending"}
                  color={p.lastBuild?.status === "SUCCESS" ? "success" :
                    p.lastBuild?.status === "FAILED" ? "error" : "warning"}
                  sx={{ mt: 1 }}
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => triggerPipeline(p._id)}>
                    Trigger Build
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
