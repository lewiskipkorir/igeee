const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const usersFile = "users.json";
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Register user
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users.push({ name, email, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.json({ message: "Registration successful!" });
});

// Login user
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ message: `Welcome back, ${user.name}!` });
});

// Admin page
app.get("/admin", (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile));
  let html = `
    <html><head><title>Igee Admin</title></head><body>
    <h1>Igee.place Users</h1>
    <table border="1"><tr><th>Name</th><th>Email</th><th>Password</th></tr>
    ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.password}</td></tr>`).join("")}
    </table></body></html>`;
  res.send(html);
});

app.listen(PORT, () => console.log(`🚀 Igee.place running on port ${PORT}`));
