import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  image:{
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  subTitle: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    type: String,
    enum: ["car_reviews", "car_comparisons","maintanance_tips", "car_modifications", "driving_tips", "new_technology", "ev_vehicles", "others"],
    required: true,
  },

  description: {
    type: String,   // HTML string
    required: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isPublished: {
    type: Boolean,
    default: true
  },

  views:{
    type: Number,
    default: 0,
  }
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);
