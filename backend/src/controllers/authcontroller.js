// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase().trim(),
//       isDeleted: false,
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     if (user.status === "Inactive") {
//       return res.status(403).json({ message: "User is inactive" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("password", password)
//     console.log(user.password)
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const result = await User.aggregate([
//       { $match: { _id: user._id } },

//       {
//         $lookup: {
//           from: "roles",
//           localField: "roles",
//           foreignField: "_id",
//           as: "role",
//         },
//       },

//       { $unwind: "$role" },

//       {
//         $match: {
//           "role.status": "Active",
//           "role.isDeleted": false,
//         },
//       },

//       { $unwind: "$role.permissions" },

//       {
//         $lookup: {
//           from: "modules",
//           localField: "role.permissions",
//           foreignField: "_id",
//           as: "module",
//         },
//       },

//       { $unwind: "$module" },

//       { $match: { "module.isActive": true } },

//       {
//         $group: {
//           _id: "$module.moduleName",
//           actions: { $addToSet: "$module.actions" },
//           roleName: { $first: "$role.name" },
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           permissions: {
//             $push: {
//               moduleName: "$_id",
//               actions: "$actions",
//             },
//           },
//           roles: { $addToSet: "$roleName" },
//         },
//       },
//     ]);

//     console.log(JSON.stringify(result, null, 2));

//     if (!result.length || !result[0].roles.length) {
//       return res.status(403).json({
//         message: "User has no active roles. Contact administrator.",
//       });
//     }

//     const { permissions, roles } = result[0];

//     const token = jwt.sign(
//       {
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         role: roles.join(", "),
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" },
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         roles,
//         permissions,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error during login" });
//   }
// };

// module.exports = { login };

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

    // 2. Check user exists and is not deleted
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false,
    });

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

    // 5. SIMPLIFIED AGGREGATION PIPELINE - FIXED
    const userPermissions = await User.aggregate([
      // Stage 1: Match the user
      { $match: { _id: user._id } },

      // Stage 2: Unwind roles array (if user has multiple roles)
      { $unwind: { path: "$roles", preserveNullAndEmptyArrays: true } },

      // Stage 3: Lookup roles
      {
        $lookup: {
          from: "roles",
          localField: "roles",
          foreignField: "_id",
          as: "roleDetails",
        },
      },

      // Stage 4: Unwind roleDetails
      { $unwind: { path: "$roleDetails", preserveNullAndEmptyArrays: true } },

      // Stage 5: Filter active, non-deleted roles
      {
        $match: {
          "roleDetails.status": "Active",
          "roleDetails.isDeleted": false,
        },
      },

      // Stage 6: Unwind permissions array
      {
        $unwind: {
          path: "$roleDetails.permissions",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 7: Lookup module details for each permission
      {
        $lookup: {
          from: "modules",
          localField: "roleDetails.permissions",
          foreignField: "_id",
          as: "moduleDetails",
        },
      },

      // Stage 8: Unwind moduleDetails
      { $unwind: { path: "$moduleDetails", preserveNullAndEmptyArrays: true } },

      // Stage 9: Filter active modules
      { $match: { "moduleDetails.isActive": true } },

      // Stage 10: Group by user and moduleName to collect actions
      {
        $group: {
          _id: {
            userId: "$_id",
            moduleName: "$moduleDetails.moduleName",
          },
          actions: { $addToSet: "$moduleDetails.actions" },
          roleNames: { $addToSet: "$roleDetails.name" },
          userName: { $first: "$name" },
          userEmail: { $first: "$email" },
        },
      },

      // Stage 11: Group by user to collect all modules
      {
        $group: {
          _id: "$_id.userId",
          modules: {
            $push: {
              moduleName: "$_id.moduleName",
              actions: "$actions",
            },
          },
          roleNames: { $first: "$roleNames" },
          name: { $first: "$userName" },
          email: { $first: "$userEmail" },
        },
      },
    ]);

    // 6. Check if we got any permissions
    let aggregatedPermissions = [];
    let roleNames = [];

    if (userPermissions.length > 0) {
      const userData = userPermissions[0];
      aggregatedPermissions = userData.modules.map((module) => ({
        moduleName: module.moduleName,
        actions: module.actions.flat().filter((action) => action), // Flatten and filter nulls
      }));
      roleNames = userData.roleNames.filter((role) => role); // Filter null roles
    } else {
      // If no permissions from aggregation, try a simpler approach
      // Get user's roles directly
      const populatedUser = await User.findById(user._id)
        .populate({
          path: "roles",
          match: {
            status: "Active",
            isDeleted: false,
          },
          populate: {
            path: "permissions",
            model: "Module",
            match: { isActive: true },
            select: "moduleName actions",
          },
        })
        .select("name email roles");

      if (populatedUser.roles && populatedUser.roles.length > 0) {
        roleNames = populatedUser.roles.map((role) => role.name);

        // Collect all unique module permissions
        const moduleMap = new Map();

        populatedUser.roles.forEach((role) => {
          if (role.permissions && role.permissions.length > 0) {
            role.permissions.forEach((permission) => {
              const moduleName = permission.moduleName;
              const action = permission.actions;

              if (!moduleMap.has(moduleName)) {
                moduleMap.set(moduleName, new Set());
              }
              moduleMap.get(moduleName).add(action);
            });
          }
        });

        // Convert map to array format
        aggregatedPermissions = Array.from(moduleMap.entries()).map(
          ([moduleName, actionsSet]) => ({
            moduleName,
            actions: Array.from(actionsSet),
          }),
        );
      }
    }

    // If still no roles, return error
    if (roleNames.length === 0) {
      return res.status(403).json({
        message: "User has no active roles. Contact administrator.",
      });
    }

    // 7. Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: roleNames.join(", "),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
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
    console.error("Login error details:", error);
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

module.exports = { login };
