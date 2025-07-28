const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
