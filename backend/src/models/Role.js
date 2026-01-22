const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  module: {
    type: String, // USER, ROLE
    required: true,
  },
  actions: {
    type: [String], // LIST, CREATE, UPDATE, DELETE
    default: [],
  },
  extras: {
    type: [String], // EXPORT, IMPORT
    default: [],
  },
},{ _id: false });

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: {
      type: [permissionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isDeleted :{
      type : Boolean,
      default : false
    },
    deletedAt :{
      type : Date,
      default : null
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", roleSchema);
