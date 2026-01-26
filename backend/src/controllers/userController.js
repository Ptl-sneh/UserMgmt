const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const { Parser } = require("json2csv");

// Validation helper function
const validateUserData = (data, isUpdate = false) => {
  const errors = {};

  /* NAME VALIDATION */
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (data.name.trim().length > 50) {
    errors.name = "Name must not exceed 50 characters";
  } else if (!/^[A-Za-z\s]+$/.test(data.name.trim())) {
    errors.name = "Name must contain only alphabets and spaces";
  }

  /* EMAIL VALIDATION  */
  if (!isUpdate) {
    if (!data.email || data.email.trim().length === 0) {
      errors.email = "Email is required";
    } else {
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }
  }

  /* PASSWORD VALIDATION  */
  if (!isUpdate) {
    if (!data.password || data.password.length === 0) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (data.password.length > 100) {
      errors.password = "Password must not exceed 100 characters";
    } else {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

      if (!passwordRegex.test(data.password)) {
        errors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      }
    }
  }

  /* ROLES VALIDATION  */
  if (data.roles !== undefined) {
    if (!Array.isArray(data.roles)) {
      errors.roles = "Roles must be an array";
    } else if (
      data.roles.some(
        (role) => typeof role !== "string" || role.trim().length === 0
      )
    ) {
      errors.roles = "Each role must be a valid non-empty value";
    }
  }

  /* HOBBIES VALIDATION  */
  if (data.hobbies !== undefined) {
    if (!Array.isArray(data.hobbies)) {
      errors.hobbies = "Hobbies must be an array";
    } else if (
      data.hobbies.some(
        (hobby) => typeof hobby !== "string" || hobby.trim().length === 0
      )
    ) {
      errors.hobbies = "Each hobby must be a valid non-empty string";
    }
  }

  /* STATUS VALIDATION  */
  if (data.status && !["Active", "Inactive"].includes(data.status)) {
    errors.status = "Status must be either Active or Inactive";
  }

  return errors;
};


// CREATE USER (Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, roles, hobbies, status } = req.body;

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

    // Validate roles if provided
    if (roles && roles.length > 0) {
      const validRoles = await Role.find({
        _id: { $in: roles },
        isDeleted: false,
      });

      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          message: "Validation failed",
          errors: { roles: "One or more roles are invalid" },
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      roles: roles || [],
      hobbies: hobbies || [],
      status: status || "Active",
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USERS (Pagination + Search + Sorting + Status Filter) - USING AGGREGATION
const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const statusFilter = req.query.status || "";

    // Build match conditions for aggregation
    const matchConditions = {
      isDeleted: false,
    };

    // Add search condition (search in name and email)
    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter if provided
    if (statusFilter && statusFilter.toLowerCase() !== "all") {
      matchConditions.status = statusFilter;
    }

    // Aggregation pipeline
    const pipeline = [
      // Stage 1: Match documents based on filters
      {
        $match: matchConditions,
      },
      // Stage 2: Lookup roles from roles collection
      {
        $lookup: {
          from: "roles",
          localField: "roles",
          foreignField: "_id",
          as: "roles",
        },
      },
      // Stage 3: Sort documents
      {
        $sort: { [sortBy]: order },
      },
      // Stage 4: Use facet to get both paginated results and total count
      {
        $facet: {
          // Paginated results
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
          ],
          // Total count
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
      // Stage 5: Reshape the output
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
    }).populate("roles");

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
    const { name, roles, hobbies, status } = req.body;

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

    // Validate roles if provided
    if (roles && roles.length > 0) {
      const validRoles = await Role.find({
        _id: { $in: roles },
        isDeleted: false,
      });

      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          message: "Validation failed",
          errors: { roles: "One or more roles are invalid" },
        });
      }
    }

    user.name = name ? name.trim() : user.name;
    user.roles = roles !== undefined ? roles : user.roles;
    user.hobbies = hobbies !== undefined ? hobbies : user.hobbies;
    user.status = status || user.status;

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
    user.status = "Inactive";
    await user.save();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// EXPORT USERS (CSV) - USING AGGREGATION
const exportUsers = async (req, res) => {
  try {
    // Apply same filters as getUsers for consistency
    const search = req.query.search || "";
    const statusFilter = req.query.status || "";

    // Build match conditions for aggregation
    const matchConditions = {
      isDeleted: false,
    };

    // Add search condition
    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter
    if (statusFilter && statusFilter.toLowerCase() !== "all") {
      matchConditions.status = statusFilter;
    }

    // Aggregation pipeline
    const pipeline = [
      // Stage 1: Match documents based on filters
      {
        $match: matchConditions,
      },
      // Stage 2: Lookup roles from roles collection
      {
        $lookup: {
          from: "roles",
          localField: "roles",
          foreignField: "_id",
          as: "roles",
        },
      },
      // Stage 3: Project and transform data for CSV
      {
        $project: {
          name: 1,
          email: 1,
          status: 1,
          hobbies: 1,
          createdAt: 1,
          roles: {
            $map: {
              input: "$roles",
              as: "role",
              in: "$$role.name",
            },
          },
        },
      },
      // Stage 4: Add formatted fields for CSV
      {
        $addFields: {
          rolesString: {
            $reduce: {
              input: "$roles",
              initialValue: "",
              in: {
                $cond: {
                  if: { $eq: ["$$value", ""] },
                  then: "$$this",
                  else: { $concat: ["$$value", ", ", "$$this"] },
                },
              },
            },
          },
          hobbiesString: {
            $reduce: {
              input: { $ifNull: ["$hobbies", []] },
              initialValue: "",
              in: {
                $cond: {
                  if: { $eq: ["$$value", ""] },
                  then: "$$this",
                  else: { $concat: ["$$value", ", ", "$$this"] },
                },
              },
            },
          },
          createdAtFormatted: {
            $dateToString: {
              format: "%m/%d/%Y",
              date: "$createdAt",
            },
          },
        },
      },
      // Stage 5: Final projection for CSV format
      {
        $project: {
          name: 1,
          email: 1,
          status: 1,
          roles: "$rolesString",
          hobbies: "$hobbiesString",
          createdAt: "$createdAtFormatted",
        },
      },
    ];

    // Execute aggregation
    const users = await User.aggregate(pipeline);

    // Generate CSV
    const parser = new Parser({
      fields: ["name", "email", "status", "roles", "hobbies", "createdAt"],
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
