const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ message: "User is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const result = await User.aggregate([
      // 1. Match the logged-in user
      { $match: { _id: user._id } },

      // 2. Normalize roles to array (CRITICAL FIX)
      {
        $addFields: {
          roles: {
            $cond: {
              if: { $isArray: "$roles" },
              then: "$roles",
              else: ["$roles"],
            },
          },
        },
      },

      // 3. Lookup the user's role
      {
        $lookup: {
          from: "roles",
          localField: "roles",
          foreignField: "_id",
          as: "role",
        },
      },

      // 4. Extract the single role
      {
        $addFields: {
          role: { $arrayElemAt: ["$role", 0] },
        },
      },

      // 5. Ensure role is active
      {
        $match: {
          "role.status": "Active",
          "role.isDeleted": false,
        },
      },

      // 6. Unwind permissions
      { $unwind: "$role.permissions" },

      // 7. Lookup module
      {
        $lookup: {
          from: "modules",
          localField: "role.permissions",
          foreignField: "_id",
          as: "module",
        },
      },

      // 8. Extract module
      { $unwind: "$module" },

      // 9. Active modules only
      { $match: { "module.isActive": true } },

      // 10. Group by module
      {
        $group: {
          _id: "$module.moduleName",
          actions: { $addToSet: "$module.actions" },
          roleName: { $first: "$role.name" },
        },
      },

      // 11. Final shape
      {
        $group: {
          _id: null,
          permissions: {
            $push: {
              moduleName: "$_id",
              actions: "$actions",
            },
          },
          roles: { $addToSet: "$roleName" },
        },
      },
    ]);

    if (!result.length || !result[0].roles.length) {
      return res.status(403).json({
        message: "User has no active roles. Contact administrator.",
      });
    }

    const { permissions, roles } = result[0];

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: roles.join(", "),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles,
        permissions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { login };
