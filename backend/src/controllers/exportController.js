const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { Parser } = require("json2csv");

const exportUsers = async (req, res) => {
  try {
    console.log(req.query)
    const search = req.query.search || "";
    const statusFilter = req.query.status || "";

    // Build match conditions
    const matchConditions = {
      isDeleted: false,
    };

    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (statusFilter && statusFilter.toLowerCase() !== "all") {
      matchConditions.status = statusFilter;
    }

    // Get users with roles
    const users = await User.find(matchConditions)
      .populate({
        path: "roles",
        select: "name",
        match: { isDeleted: false },
      })
      .lean();

    // Format data for CSV
    const formattedUsers = users.map((user) => ({
      "Full Name": user.name,
      Email: user.email,
      Status: user.status,
      Roles: user.roles?.map((role) => role.name).join(", ") || "No Roles",
      Hobbies: Array.isArray(user.hobbies) ? user.hobbies.join(", ") : "",
      "Created Date": new Date(user.createdAt).toLocaleDateString(),
      "Last Updated": new Date(user.updatedAt).toLocaleDateString(),
    }));

    // Generate CSV
    const parser = new Parser({
      fields: [
        "Full Name",
        "Email",
        "Status",
        "Roles",
        "Hobbies",
        "Created Date",
        "Last Updated",
      ],
    });
    const csv = parser.parse(formattedUsers);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `users_export_${timestamp}.csv`;

    // Define export directory (same as multer config)
    const backendRoot = path.resolve(__dirname, "..", "..");
    const exportDir = path.join(backendRoot, "exports");

    // Ensure directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Save file to disk storage
    const filePath = path.join(exportDir, filename);
    fs.writeFileSync(filePath, csv);

    // Create download URL that matches your static route in server.js
    const downloadUrl = `${req.protocol}://${req.host}/exports/${filename}`;

    // Return JSON response with download URL
    res.json({
      success: true,
      message: "CSV exported successfully",
      downloadUrl: downloadUrl,
      filename: filename,
      recordCount: users.length,
    });
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting users",
      error: error.message,
    });
  }
};

module.exports = {
  exportUsers,
};
