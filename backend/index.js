import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect("mongodb://mongo:27017/smartops", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// --- Models ---
const pipelineSchema = new mongoose.Schema({
  name: String,
  jenkinsJob: String,
  repo: String,
  createdAt: { type: Date, default: Date.now },
  lastBuild: {
    number: Number,
    status: String,
    timestamp: Number,
  },
});

const Pipeline = mongoose.model("Pipeline", pipelineSchema);

// --- Jenkins Config ---
const JENKINS_URL = "http://your-jenkins-server:8080";
const JENKINS_USER = "admin";
const JENKINS_TOKEN = "your-api-token"; // you’ll generate this in Jenkins
const AUTH = Buffer.from(`${JENKINS_USER}:${JENKINS_TOKEN}`).toString("base64");

// --- Routes ---

// Create new pipeline
app.post("/api/pipelines", async (req, res) => {
  try {
    const { name, jenkinsJob, repo } = req.body;
    const pipeline = new Pipeline({ name, jenkinsJob, repo });
    await pipeline.save();

    // create Jenkins job dynamically
    const xmlConfig = `
      <flow-definition plugin="workflow-job@2.44">
        <description>${name}</description>
        <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.1006">
          <scm class="hudson.plugins.git.GitSCM" plugin="git@5.0.2">
            <userRemoteConfigs>
              <hudson.plugins.git.UserRemoteConfig>
                <url>${repo}</url>
              </hudson.plugins.git.UserRemoteConfig>
            </userRemoteConfigs>
            <branches><hudson.plugins.git.BranchSpec><name>*/main</name></hudson.plugins.git.BranchSpec></branches>
          </scm>
          <scriptPath>Jenkinsfile</scriptPath>
          <lightweight>true</lightweight>
        </definition>
      </flow-definition>
    `;

    await fetch(`${JENKINS_URL}/createItem?name=${jenkinsJob}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${AUTH}`,
        "Content-Type": "application/xml",
      },
      body: xmlConfig,
    });

    res.json({ message: "Pipeline created and Jenkins job initialized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create pipeline" });
  }
});

// Get all pipelines
app.get("/api/pipelines", async (_, res) => {
  const list = await Pipeline.find().sort({ createdAt: -1 });
  res.json(list);
});

// Trigger Jenkins build
app.post("/api/pipelines/:id/trigger", async (req, res) => {
  const pipeline = await Pipeline.findById(req.params.id);
  if (!pipeline) return res.status(404).json({ error: "Not found" });

  await fetch(`${JENKINS_URL}/job/${pipeline.jenkinsJob}/build`, {
    method: "POST",
    headers: { Authorization: `Basic ${AUTH}` },
  });

  res.json({ message: "Build triggered" });
});

// Get Jenkins build status
app.get("/api/pipelines/:id/status", async (req, res) => {
  const pipeline = await Pipeline.findById(req.params.id);
  const result = await fetch(`${JENKINS_URL}/job/${pipeline.jenkinsJob}/lastBuild/api/json`, {
    headers: { Authorization: `Basic ${AUTH}` },
  });
  const data = await result.json();
  pipeline.lastBuild = {
    number: data.number,
    status: data.result,
    timestamp: data.timestamp,
  };
  await pipeline.save();
  res.json(pipeline);
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(5000, "0.0.0.0", () => {
  console.log("SmartOps backend running on port 5000");
});
