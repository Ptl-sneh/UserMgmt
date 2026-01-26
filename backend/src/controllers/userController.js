const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const { Parser } = require("json2csv");

// Validation helper function
const validateUserData = (data, isUpdate = false) => {
  const errors = {};

  /* NAME VALIDATION */
  if (!data.userName || data.userName.trim().length === 0) {
    errors.userName = "Username is required";
  } else if (data.userName.trim().length < 2) {
    errors.userName = "Username must be at least 2 characters long";
  } else if (data.userName.trim().length > 50) {
    errors.userName = "Username must not exceed 50 characters";
  }

  /* EMAIL VALIDATION */
  if (!isUpdate) {
    if (!data.email || data.email.trim().length === 0) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }
  }

  /* PASSWORD VALIDATION */
  if (!isUpdate) {
    if (!data.password || data.password.length === 0) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (data.password.length > 100) {
      errors.password = "Password must not exceed 100 characters";
    }
  }

  /* ROLE VALIDATION */
  if (data.roleId !== undefined) {
    if (typeof data.roleId !== "string" || data.roleId.trim().length === 0) {
      errors.roleId = "Valid role ID is required";
    }
  }

  /* STATUS VALIDATION */
  if (data.status && !["active", "inactive"].includes(data.status.toLowerCase())) {
    errors.status = "Status must be either active or inactive";
  }

  return errors;
};

// CREATE USER (Admin)
const createUser = async (req, res) => {
  try {
    const { userName, email, password, roleId, status } = req.body;

    // Validate input
    const validationErrors = validateUserData(req.body, false);

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Validation failed",
        errors: { email: "Email already exists" },
      });
    }

    // Validate role if provided
    if (roleId) {
      const validRole = await Role.findOne({
        _id: roleId,
        isDeleted: false,
      });

      if (!validRole) {
        return res.status(400).json({
          message: "Validation failed",
          errors: { roleId: "Role is invalid" },
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName: userName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      roleId: roleId || null,
      status: (status || "active").toLowerCase(),
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USERS (Pagination + Search + Sorting + Status Filter)
const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const statusFilter = req.query.status || "";

    // Build match conditions
    const matchConditions = {
      isDeleted: false,
    };

    // Add search condition
    if (search) {
      matchConditions.$or = [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter if provided
    if (statusFilter && statusFilter.toLowerCase() !== "all") {
      matchConditions.status = statusFilter.toLowerCase();
    }

    // Aggregation pipeline
    const pipeline = [
      // Stage 1: Match documents based on filters
      {
        $match: matchConditions,
      },
      // Stage 2: Lookup role from roles collection
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      // Stage 3: Unwind role array
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 4: Sort documents
      {
        $sort: { [sortBy]: order },
      },
      // Stage 5: Use facet to get both paginated results and total count
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
      // Stage 6: Reshape the output
      {
        $project: {
          users: "$paginatedResults",
          total: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
        },
      },
    ];

    const result = await User.aggregate(pipeline);

    // Extract results from aggregation output
    const aggregationResult = result[0] || { users: [], total: 0 };
    const users = aggregationResult.users || [];
    const total = aggregationResult.total || 0;

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("roleId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { userName, roleId, status } = req.body;

    // Validate input
    const validationErrors = validateUserData(req.body, true);

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate role if provided
    if (roleId) {
      const validRole = await Role.findOne({
        _id: roleId,
        isDeleted: false,
      });

      if (!validRole) {
        return res.status(400).json({
          message: "Validation failed",
          errors: { roleId: "Role is invalid" },
        });
      }
    }

    user.userName = userName ? userName.trim() : user.userName;
    user.roleId = roleId !== undefined ? roleId : user.roleId;
    user.status = status ? status.toLowerCase() : user.status;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.status = "inactive";
    await user.save();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// EXPORT USERS (CSV)
const exportUsers = async (req, res) => {
  try {
    // Apply same filters as getUsers for consistency
    const search = req.query.search || "";
    const statusFilter = req.query.status || "";

    // Build match conditions
    const matchConditions = {
      isDeleted: false,
    };

    // Add search condition
    if (search) {
      matchConditions.$or = [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter
    if (statusFilter && statusFilter.toLowerCase() !== "all") {
      matchConditions.status = statusFilter.toLowerCase();
    }

    // Aggregation pipeline
    const pipeline = [
      // Stage 1: Match documents based on filters
      {
        $match: matchConditions,
      },
      // Stage 2: Lookup role from roles collection
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      // Stage 3: Unwind role array
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 4: Project and transform data for CSV
      {
        $project: {
          userName: 1,
          email: 1,
          status: 1,
          createdAt: 1,
          roleName: "$role.roleName",
        },
      },
      // Stage 5: Add formatted fields for CSV
      {
        $addFields: {
          createdAtFormatted: {
            $dateToString: {
              format: "%m/%d/%Y",
              date: "$createdAt",
            },
          },
        },
      },
      // Stage 6: Final projection for CSV format
      {
        $project: {
          userName: 1,
          email: 1,
          status: 1,
          role: "$roleName",
          createdAt: "$createdAtFormatted",
        },
      },
    ];

    // Execute aggregation
    const users = await User.aggregate(pipeline);

    // Generate CSV
    const parser = new Parser({
      fields: ["userName", "email", "status", "role", "createdAt"],
    });
    const csv = parser.parse(users);

    // Set headers for file download
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", "attachment; filename=users.csv");

    // Send CSV data
    res.send(csv);
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({ message: "Server error while exporting" });
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