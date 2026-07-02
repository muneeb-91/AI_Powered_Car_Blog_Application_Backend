import express from "express";
import { createBlog, getAllBlogs, getSingleBlog, getMyBlogs, deleteBlog, getLatestBlog, getTrendingBlogs, getNewTechnologyBlogs, getBlogsByCategory, generateContent } from "../controllers/blogController.js";
import { protect } from "../middlewares/auth.js";
import upload from '../config/multer.js';

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/my-blogs", protect, getMyBlogs);
router.get("/latest-blog", getLatestBlog);
router.get("/new-technology", getNewTechnologyBlogs);
router.get("/trending", getTrendingBlogs);
router.get("/:id", getSingleBlog);
router.get('/categorized-blogs/:category', getBlogsByCategory);

// Protected Routes
router.post("/create", protect, upload.single("image"), createBlog);
router.post("/create/generate-content", protect, generateContent);
router.delete("/:id", protect, deleteBlog);

export default router;
