const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const Module = require("../models/Modules");

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
    const user = await User.findOne({ email });
    console.log(user)

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

    // 5. Get user's role and permissions
    const role = await Role.findOne({ 
      _id: user.roleId,
      status: "Active"
    }).populate("permissions");
    console.log(user.roles[0])
    
    if (!role) {
      return res.status(403).json({ message: "Role not found or inactive" });
    }

    // 6. Aggregate permissions
    const aggregatedPermissionsMap = new Map();

    // Process each permission from role
    role.permissions.forEach((permission) => {
      const moduleName = permission.moduleName;
      const action = permission.action; // Changed from "actions" to "action"
      
      if (aggregatedPermissionsMap.has(moduleName)) {
        // Module already exists, add action if not already present
        const existing = aggregatedPermissionsMap.get(moduleName);
        if (!existing.actions.includes(action)) {
          existing.actions.push(action);
        }
      } else {
        // Add new module
        aggregatedPermissionsMap.set(moduleName, {
          moduleName: moduleName,
          actions: [action], // Single action as array
        });
      }
    });

    // Convert map to array
    const aggregatedPermissions = Array.from(aggregatedPermissionsMap.values());

    // 7. Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.userName, // Changed from user.name to user.userName
        email: user.email,
        role: role.roleName, // Changed from roles array to single role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 8. Send response with structured permissions
    res.json({
      token,
      user: {
        id: user._id,
        name: user.userName, // Changed from user.name to user.userName
        email: user.email,
        role: role.roleName, // Single role instead of array
        permissions: aggregatedPermissions,
      },
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };