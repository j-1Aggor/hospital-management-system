const jwt = require("jsonwebtoken");
const Workers = require("../models/Workers");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ status: "failed", data: "Not authorized" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Workers.findById(decoded._id);
      console.log(decoded);
      next();
    } catch (err) {
      res
        .status(401)
        .json({ status: "failed", data: "Error verifying the token" });
    }
  } catch (err) {
    res.status(501).json({ status: "failed", data: "Internal server error" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          status: "failed",
          data: `${req.user.role} not authorized for this route`,
        });
    }
    next();
  };
};

module.exports = { protect, authorize };
