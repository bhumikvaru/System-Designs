const express = require('express');
const app = express();
const port = 3001;

// Mock profile data
const profiles = [
  { id: 1, username: 'john_doe' }
];

let simulateFailure = false;

// Endpoint to toggle failure simulation
app.get('/toggle-failure', (req, res) => {
  simulateFailure = !simulateFailure;
  res.json({ status: `Failure simulation ${simulateFailure ? 'enabled' : 'disabled'}` });
});

// Endpoint to get profile
app.get('/profile/:userId', (req, res) => {
  if (simulateFailure) {
    return res.status(500).json({ error: 'Simulated failure' });
  }
  const profile = profiles.find(p => p.id === parseInt(req.params.userId));
  if (profile) {
    
    res.json(profile);
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

app.listen(port, () => {
  console.log(`Profile service running at http://localhost:${port}`);
});
