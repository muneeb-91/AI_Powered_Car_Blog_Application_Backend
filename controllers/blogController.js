import fs from 'fs';
import cloudinary from "../config/cloudinary.js";
import Blog from "../models/blogModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const createBlog = async (req, res) => {
  const { title, subTitle, category, description } = req.body;

  if (!req.file) throw "Image is required";
  if (!title) throw "Title must be provided";
  if (!subTitle) throw "Title must be provided";
  if (!category) throw "Please select a category";
  if (!description) throw "Description must be provided";
  if (description.length < 250) throw "Description should be at least 250 characters";

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "blogs",
  });

  fs.unlink(req.file.path, (error) => {
    if(error) console.log("Failed to delete local file"); 
  });

  const blog = await Blog.create({
    image: result.secure_url,
    title,
    subTitle,
    category,
    description,
    author: req.user._id,
    isPublished: true,
  });

  res.status(200).json({
    success: true,
    message: "Blog created successfully!",
    blog,
  });
};

export const getAllBlogs = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalBlogs = await Blog.countDocuments({ isPublished: true });

  const blogs = await Blog.find({ isPublished: true })
    .populate("author", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(totalBlogs / limit),
    totalBlogs,
    blogs,
  });
};

export const getSingleBlog = async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true },
  ).populate("author", "email name");

  if (!blog) throw "Blog not found";
  if (!blog.isPublished) throw "Blog is not published yet!";

  console.log(blog);

  res.status(200).json({
    success: true,
    blog,
  });
};

export const getMyBlogs = async (req, res) => {
  const blogs = await Blog.find({ author: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: blogs.length,
    blogs,
  });
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) throw "Blog not fount!";

  if (blog.author.toString() !== req.user._id.toString()) throw "You are not authorized";

  // extract the public id of the image from secure_url
  const imageUrl = blog.image;
  const publicId = "blogs/" + imageUrl.split("/").pop().split(".")[0];

  // delete image from cloudinary
  await cloudinary.uploader.destroy(publicId);

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully!",
  });
};

export const getLatestBlog = async (req, res) => {
  const blog = await Blog.findOne()
    .sort({ createdAt: -1 })
    .populate("author", "email name");

  res.status(200).json({
    success: true,
    blog,
  });
};

export const getTrendingBlogs = async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
    .sort({ views: -1 })
    .limit(5)
    .populate("author", "name");

  res.status(200).json({
    success: true,
    blogs,
  });
};

export const getNewTechnologyBlogs = async (req, res) => {
  const blogs = await Blog.find({
    isPublished: true,
    category: "new_technology",
  }).sort("-createdAt").limit(4).populate("author", "name");

  res.status(200).json({
    success: true,
    blogs,
  });
};

export const getBlogsByCategory = async (req, res) => {
  const { category } = req.params;
  const blogs = await Blog.find({ isPublished: true, category: category }).populate("author", "name");

  res.status(200).json({
    success: true,
    blogs,
  });
};

export const generateContent = async (req, res) => {
  const { title, subTitle, category } = req.body;
  if(!title) throw "Title is required to generate description";
  if(title.length < 30) throw "Title should be at least 30 characters long";
  if(!subTitle) throw "Sub Title is required to generate description";
  if(subTitle.length < 30) throw "Sub Title should be at least 30 characters long";
  if(!category) throw "Category is required to generate description";

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Write a compelling blog description for:
Title: ${title}
Subtitle: ${subTitle}
Category: ${category}

The description should be approximately 700 words, engaging, and SEO-friendly.

IMPORTANT FORMATTING RULES:
- Use ONLY valid HTML tags that work with Quill rich text editor
- Use <h2> for section headings (NOT # or markdown)
- Use <h3> for subheadings
- Use <p> for paragraphs
- Use <ul> and <li> for bullet points
- Use <ol> and <li> for numbered lists
- Use <strong> for bold text
- Use <em> for italic text
- Don't leave too much spaces after headings or paragraph, use only 1 line empty space when needed
- Main sub headings should also be bold
- Do NOT use markdown syntax (#, **, *, etc.)
- Do NOT wrap the entire response in <html> or <body> tags
- Return ONLY the HTML content, no explanations before or after

Example format:
<h2>Why This Comparison Matters</h2>
<p>Your paragraph here...</p>
<h3>Key Features</h3>
<ul><li>First feature</li><li>Second feature</li></ul>

Now generate the HTML content.`;

  const result = await model.generateContent(prompt);
  const description = result.response.text();

  res.json({
        success: true, 
        description
    });
};
