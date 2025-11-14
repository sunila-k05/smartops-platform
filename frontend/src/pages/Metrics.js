import React from "react";
import { Typography } from "@mui/material";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Build 1", duration: 4 },
  { name: "Build 2", duration: 6 },
  { name: "Build 3", duration: 3 },
  { name: "Build 4", duration: 5 },
];

export default function Metrics() {
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Build Metrics
      </Typography>
      <LineChart width={600} height={300} data={data}>
        <Line type="monotone" dataKey="duration" stroke="#82ca9d" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </div>
  );
}
