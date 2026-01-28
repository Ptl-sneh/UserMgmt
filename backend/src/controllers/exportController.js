const path = require('path')
const upload = require('../config/multer')
const fs = require("fs");
const User = require("../models/User");
const Role = require("../models/Role");
const { Parser } = require("json2csv");


const exportUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const statusFilter = req.query.status || "";

    // Build match conditions
    const matchConditions = {
      isDeleted: false,
    };

    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" }},
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (statusFilter && statusFilter.toLowerCase() !== "all") {
      matchConditions.status = statusFilter;
    }

    // Get users with roles
    const users = await User.find(matchConditions)
      .populate({
        path: 'roles',
        select: 'name',
        match: { isDeleted: false }
      })
      .lean();

    // Format data for CSV
    const formattedUsers = users.map(user => ({
      "Full Name": user.name,
      "Email": user.email,
      "Status": user.status,
      "Roles": user.roles?.map(role => role.name).join(', ') || 'No Roles',
      "Hobbies": Array.isArray(user.hobbies) ? user.hobbies.join(', ') : '',
      "Created Date": new Date(user.createdAt).toLocaleDateString(),
      "Last Updated": new Date(user.updatedAt).toLocaleDateString()
    }));

    // Generate CSV
    const parser = new Parser({
      fields: ["Full Name", "Email", "Status", "Roles", "Hobbies", "Created Date", "Last Updated"]
    });
    const csv = parser.parse(formattedUsers);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `users_export_${timestamp}.csv`;
    
    // Use Multer to save the file
    const exportDir = path.join(__dirname, '..', '..', 'exports');
    
    // Ensure directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Save file using fs (Multer doesn't work well with generated files)
    const filePath = path.join(exportDir, filename);
    fs.writeFileSync(filePath, csv);

    // Create download URL
    const downloadUrl = `/api/users/download/${filename}`;

    // Return the URL
    res.json({
      success: true,
      message: "CSV exported successfully",
      downloadUrl: downloadUrl,
      filename: filename,
      recordCount: users.length,
      fullPath: filePath  // For debugging
    });

  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting users",
      error: error.message
    });
  }
};

const downloadFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const exportDir = path.join(__dirname, '..', '..', 'exports');
    const filePath = path.join(exportDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the file
    res.sendFile(filePath);

  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading file"
    });
  }
};


module.exports = {
    exportUsers,
    downloadFile
}