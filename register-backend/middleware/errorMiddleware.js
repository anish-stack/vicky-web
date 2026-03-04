
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        const fields = Object.values(err.errors).map(e => e.message);
        message = fields.join(", ");
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message = "File size exceeds 5MB limit.";
    }

    if (err.code === "LIMIT_FILE_COUNT") {
        statusCode = 400;
        message = "Too many files uploaded.";
    }

    if (process.env.NODE_ENV === "development") {
        console.error("❌ Error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

module.exports = errorHandler;