import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const user = await User.create({ username, password });
    const token = signToken(user._id);
    res.status(201).json({
      user: { id: user._id, username: user.username },
      token
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken(user._id);
    res.json({
      user: { id: user._id, username: user.username },
      token
    });
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username || username.length < 1) {
      return res.status(400).json({ message: "Username query is required" });
    }
    const users = await User.find(
      { username: { $regex: username, $options: "i" } },
      { username: 1 }
    ).limit(10);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};
