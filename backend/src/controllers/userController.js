const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Validation helper function
const validateUserData = (data, isUpdate = false) => {
  const errors = {};

  /* NAME VALIDATION */
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Username is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Username must be at least 2 characters long";
  } else if (data.name.trim().length > 50) {
    errors.name = "Username must not exceed 50 characters";
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

  /* ROLES VALIDATION */
  if (data.roles !== undefined) {
    if (!Array.isArray(data.roles)) {
      errors.roles = "Roles must be an array";
    } else {
      // Validate each role ID
      const invalidRoleIds = data.roles.filter(
        id => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidRoleIds.length > 0) {
        errors.roles = "Invalid role ID(s) provided";
      }
    }
  }

  /* HOBBIES VALIDATION */
  if (data.hobbies !== undefined) {
    if (!Array.isArray(data.hobbies)) {
      errors.hobbies = "Hobbies must be an array";
    } else {
      // Validate each hobby is a string
      const invalidHobbies = data.hobbies.filter(
        hobby => typeof hobby !== 'string' || hobby.trim().length === 0
      );
      if (invalidHobbies.length > 0) {
        errors.hobbies = "All hobbies must be non-empty strings";
      }
    }
  }

  /* STATUS VALIDATION */
  if (data.status && !["Active", "Inactive"].includes(data.status)) {
    errors.status = "Status must be either Active or Inactive";
  }

  return errors;
};

// CREATE USER (Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, roles = [], hobbies = [], status } = req.body;

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
    if (roles.length > 0) {
      // Check if all role IDs exist and are active
      const validRoles = await Role.find({
        _id: { $in: roles },
        isDeleted: false,
      });

      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          message: "Validation failed",
          errors: { roles: "One or more roles are invalid or deleted" },
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      roles: roles, // Array of role IDs
      hobbies: hobbies.map(hobby => hobby.trim()), // Array of hobbies
      status: status || "Active",
    });

    // Populate roles before returning
    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'roles',
        select: 'name status'
      });

    res.status(201).json(populatedUser);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
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
          as: "roleDetails",
        },
      },
      // Stage 3: Sort documents
      {
        $sort: { [sortBy]: order },
      },
      // Stage 4: Use facet to get both paginated results and total count
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
            // Add fields for easier frontend consumption
            {
              $addFields: {
                roles: "$roleDetails"
              }
            },
            {
              $project: {
                roleDetails: 0
              }
            }
          ],
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
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate({
      path: 'roles',
      select: 'name status permissions'
    });

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
    if (roles !== undefined) {
      if (roles.length > 0) {
        // Check if all role IDs exist and are active
        const validRoles = await Role.find({
          _id: { $in: roles },
          isDeleted: false,
        });

        if (validRoles.length !== roles.length) {
          return res.status(400).json({
            message: "Validation failed",
            errors: { roles: "One or more roles are invalid or deleted" },
          });
        }
      }
      user.roles = roles;
    }

    // Update other fields if provided
    if (name) user.name = name.trim();
    if (hobbies !== undefined) user.hobbies = hobbies.map(hobby => hobby.trim());
    if (status) user.status = status;

    await user.save();

    // Populate roles before returning
    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'roles',
        select: 'name status'
      });

    res.json(populatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};