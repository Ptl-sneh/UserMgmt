const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const { Parser } = require("json2csv");

// CREATE USER (Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, roles, hobbies, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roles: roles || [],
      hobbies: hobbies || [],
      status: status || "Active",
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET USERS (Pagination + Search + Sorting)
const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const users = await User.find(query)
      .populate("roles")
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("roles");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { name, roles, hobbies, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.roles = roles || user.roles;
    user.hobbies = hobbies || user.hobbies;
    user.status = status || user.status;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// EXPORT USERS (CSV)
const exportUsers = async (req, res) => {
  try {
    const users = await User.find().populate("roles");

    const data = users.map((user) => ({
      name: user.name,
      email: user.email,
      status: user.status,
      roles: user.roles.map((r) => r.name).join(", "),
      hobbies: user.hobbies.join(", "),
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  exportUsers,
};
