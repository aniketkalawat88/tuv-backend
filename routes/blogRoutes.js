const express = require("express");
const Blog = require("../models/Blog");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

// Setup Multer with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog-images",
    format: async () => "png",
    public_id: (req, file) => file.fieldname + "-" + Date.now(),
  },
});

const upload = multer({ storage: storage });


// POST - Create a new blog
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, author } = req.body;
    const imageUrl = req.file.path;

    const newBlog = new Blog({ title, description, image: imageUrl, author });
    await newBlog.save();

    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: "Error creating blog", error });
  }
});

// GET - Fetch all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({success:true, message:"All Blogs Success", blogs});
  } catch (error) {
    res.status(500).json({success:false, message: "Error fetching blogs", error });
  }
});


// PUT - Update a blog by ID (Delete old image and upload new one)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description, author } = req.body;

    // Find existing blog
    const existingBlog = await Blog.findById(req.params.id);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let updateData = { title, description, author };

    // If new image is uploaded, delete the old image from Cloudinary
    if (req.file) {
      // Extract the public ID from the existing image URL
      const oldImageUrl = existingBlog.image;
      const oldImagePublicId = oldImageUrl.split('/').pop().split('.')[0]; // Extract public ID

      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(`blog-images/${oldImagePublicId}`);

      // Set new image URL
      updateData.image = req.file.path;
    }

    // Update blog in database
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error });
  }
});


// DELETE - Remove a blog by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
});

module.exports = router;
