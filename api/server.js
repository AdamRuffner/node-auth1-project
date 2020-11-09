const express = require("express");
const server = express();
const helmet = require("helmet");
const cors = require("cors");

const bcrypt = require("bcryptjs");
const session = require("express-session");
const sessionStore = require("connect-session-knex")(session);
const Users = require("../users/users-model");

const UsersRouter = require("../users/users-router");

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(
  session({
    name: "monkey",
    secret: "come from process.env",
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false, // make true for production
      httpOnly: true, // JS on page can't read the cookie
    },
    resave: false,
    saveUninitialized: false,
    store: new sessionStore({
      knex: require("../data/db-config"),
      tablename: "sessions",
      sidfieldname: "sid",
      createTable: true,
      clearInterval: 1000 * 60 * 60,
    }),
  })
);

server.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const user = { username, password: hash };
    const addedUser = await Users.add(user);
    res.json(addedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.post("/auth/login", async (req, res) => {
  try {
    const [user] = await Users.findBy({ username: req.body.username });
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user = user;
      res.json({ message: `welcome back, ${user.username}` });
    } else {
      res.status(401).json({ message: "bad credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.messsage });
  }
});

server.get("/auth/logout", (req, res) => {
  if (req.session && req.session.user) {
    req.session.destroy((err) => {
      if (err) res.json({ message: "you cannot leave" });
      else res.json({ message: "good bye" });
    });
  } else {
    res.json({ message: "there is no session" });
  }
});

server.use("/api/users", UsersRouter);

module.exports = server;
