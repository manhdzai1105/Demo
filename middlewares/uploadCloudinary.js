const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const ErrorResponse = require("../helpers/ErrorResponse");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload multiple images to Cloudinary
const uploadMultiple = async (req, res, next) => {
  const images = req.files;
  if (!images || images.length === 0) {
    return next(new ErrorResponse(400, "No images provided!"));
  }

  const imageUrls = [];
  const publicIds = [];
  try {
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "auto",
      });
      imageUrls.push(result.secure_url);
      publicIds.push(result.public_id);
    }
    req.imageUrls = imageUrls;
    req.publicIds = publicIds;
    next();
  } catch (error) {
    await deleteImages(req.publicIds);
    return next(new ErrorResponse(500, "Error uploading images!"));
  }
};

const uploadSingle = async (req, res, next) => {
  const image = req.file;
  if (!image) {
    return next(new ErrorResponse(400, "No image provided!"));
  }

  try {
    const result = await cloudinary.uploader.upload(image.path, {
      resource_type: "auto",
    });
    req.imageUrl = result.secure_url;
    req.publicId = result.public_id;
    next();
  } catch (error) {
    await deleteImages(req.publicId);
    return next(new ErrorResponse(500, "Error uploading the image!"));
  }
};

const deleteImages = async (publicIds) => {
  if (typeof publicIds === "string") {
    publicIds = [publicIds];
  }
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return;
  }

  for (const publicId of publicIds) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error(`Failed to delete image with publicId: ${publicId}`, err);
    }
  }
};

const restoreImage = async (imageUrl, publicId) => {
  try {
    // Đảm bảo rằng imageUrl có giá trị hợp lệ
    if (!imageUrl || !publicId) {
      throw new Error("Invalid image URL or public ID.");
    }

    // Tải lại ảnh với publicId cũ và ghi đè lên ảnh cũ trên Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      overwrite: true, // Ghi đè ảnh cũ
    });
    console.log(`Successfully restored the image with publicId: ${publicId}`);
    return result;
  } catch (error) {
    console.error("Failed to restore the old image:", error);
    throw error;
  }
};

module.exports = {
  uploadMultiple,
  uploadSingle,
  deleteImages,
  cloudinary,
  restoreImage,
};
