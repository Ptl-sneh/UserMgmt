const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2. Check user
    const user = await User.findOne({ email }).populate("roles");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Check status
    if (user.status === "Inactive") {
      return res.status(403).json({ message: "User is inactive" });
    }

    // 4. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 5. Aggregate permissions from all active roles
    let aggregatedPermissions = [];

    user.roles.forEach((role) => {
      if (role.status === "Active") {
        // Merge permissions from each role
        role.permissions.forEach((perm) => {
          const existingModule = aggregatedPermissions.find(
            (p) => p.moduleName === perm.moduleName
          );

          if (existingModule) {
            // Merge actions (avoid duplicates)
            perm.actions.forEach((action) => {
              if (!existingModule.actions.includes(action)) {
                existingModule.actions.push(action);
              }
            });

            // Merge nested permissions (avoid duplicates)
            perm.nestedPermissions.forEach((nestedPerm) => {
              if (!existingModule.nestedPermissions.includes(nestedPerm)) {
                existingModule.nestedPermissions.push(nestedPerm);
              }
            });
          } else {
            // Add new module
            aggregatedPermissions.push({
              moduleName: perm.moduleName,
              actions: [...perm.actions],
              nestedPermissions: [...perm.nestedPermissions],
            });
          }
        });
      }
    });

    // 6. Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((role) => role.name),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 7. Send response with structured permissions
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((role) => role.name),
        permissions: aggregatedPermissions, // Now contains structured permissions
      },
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };