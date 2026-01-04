export const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ message: "Username already exists" });
  }
  
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({ message });
};
