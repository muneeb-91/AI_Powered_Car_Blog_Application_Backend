import 'express-async-error';
import './config/env.js';
import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { errorHandler } from './handlers/errorHandler.js';
import { connectDB } from './lib/db.js';
import userRoute from './routes/userRoute.js';
import blogRoute from './routes/blogRoute.js';

const port = process.env.PORT || 5001;

const app = express();
app.use(cookieParser());
app.use(express.json());
// app.use(cors({
//   origin: "https://ai-powered-car-blog-application-fro.vercel.app",
//   credentials: true
// }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// routes
app.use('/api/user', userRoute);
app.use('/api/blog', blogRoute);

app.use(errorHandler);

app.listen(port, ()=>{
  console.log(`Server is running on port: ${port}`);
  connectDB();
})