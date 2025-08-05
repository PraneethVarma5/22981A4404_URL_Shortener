import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
} from "@mui/material";

const BACKEND_URL = "http://localhost:5000";

function App() {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState(30);
  const [shortcode, setShortcode] = useState("");
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState([]);

  const handleSubmit = async () => {
    if (!url.startsWith("http")) return alert("Invalid URL");

    const body = { url, validity };
    if (shortcode) body.shortcode = shortcode;

    const res = await fetch(`${BACKEND_URL}/shorturls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      setResults((prev) => [...prev, data]);
      setUrl("");
      setShortcode("");
    } else {
      alert(data.error);
    }
  };

  const fetchStats = async () => {
    const res = await fetch(`${BACKEND_URL}/shorturls/stats`);
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchStats();
  }, [results]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Enter Long URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Validity (min)"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label="Shortcode (optional)"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Shorten
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4 }}>
         Shortened URLs
      </Typography>
      {results.map((res, i) => (
        <Paper key={i} sx={{ p: 2, my: 1 }}>
          <p>
            <strong>Link:</strong>{" "}
            <a href={res.shortLink} target="_blank" rel="noreferrer">
              {res.shortLink}
            </a>
          </p>
           <p>
            <strong>Expires At:</strong> {new Date(res.expiry).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
        </Paper>
      ))}

      <Typography variant="h6" sx={{ mt: 4 }}>
         Statistics
      </Typography>
      {stats.map((s, i) => (
        <Paper key={i} sx={{ p: 2, my: 1 }}>
          <p>
            <strong>Short Link:</strong>{" "}
            <a href={s.shortLink} target="_blank" rel="noreferrer">
              {s.shortLink}
            </a>
          </p>
          <p>
            <strong>Original URL:</strong> {s.originalUrl}
          </p>
          <p>
            <strong>Expiry:</strong> {new Date(s.expiry).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
          <p>
            <strong>Clicks:</strong> {s.clicks.length}
          </p>
          {s.clicks.map((click, j) => (
            <p key={j}>
              - {click.timestamp} via {click.source}
            </p>
          ))}
        </Paper>
      ))}
    </Container>
  );
}

export default App;
