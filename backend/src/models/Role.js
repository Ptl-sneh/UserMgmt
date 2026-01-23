const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: {
      type: [
        {
          moduleName: {
            type: String,
            required: true,
            trim: true,
          },
          actions: {
            type: [String],
            default: [],
          },
          nestedPermissions: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", roleSchema);
