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

    // 5. Use aggregation to get user roles and aggregated permissions
    const userWithPermissions = await User.aggregate([
      // Match the user
      { $match: { _id: user._id } },
      
      // Lookup roles
      {
        $lookup: {
          from: "roles",
          localField: "roles",
          foreignField: "_id",
          as: "userRoles"
        }
      },
      
      // Filter active roles
      {
        $unwind: {
          path: "$userRoles",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "userRoles.status": "Active",
          "userRoles.isDeleted": false
        }
      },
      
      // Lookup permissions (modules) for each role
      {
        $lookup: {
          from: "modules",
          localField: "userRoles.permissions",
          foreignField: "_id",
          as: "rolePermissions"
        }
      },
      
      // Unwind permissions to process each one
      { $unwind: "$rolePermissions" },
      
      // Group by moduleName and collect unique actions
      {
        $group: {
          _id: "$rolePermissions.moduleName",
          actions: { $addToSet: "$rolePermissions.actions" },
          roleNames: { $addToSet: "$userRoles.name" }
        }
      },
      
      // Project to final format
      {
        $project: {
          _id: 0,
          moduleName: "$_id",
          actions: 1,
          roleNames: 1
        }
      },
      
      // Sort by moduleName
      { $sort: { moduleName: 1 } }
    ]);

    if (userWithPermissions.length === 0) {
      return res.status(403).json({ message: "No active roles found for user" });
    }

    // Extract aggregated permissions and role names
    const aggregatedPermissions = userWithPermissions.map(item => ({
      moduleName: item.moduleName,
      actions: item.actions
    }));

    // Get unique role names from all groups
    const roleNames = [...new Set(userWithPermissions.flatMap(item => item.roleNames))];
    const roleNamesString = roleNames.join(", ");

    // 7. Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: roleNamesString,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 8. Send response with structured permissions
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: roleNames,
        permissions: aggregatedPermissions,
      },
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };