const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

const verifyAdmin = (AdminModel) => async (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token || !token.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized" });

  token = token.split(" ")[1];

 
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token expired. Please login again." });
  }
  

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const admin = await AdminModel.findById(decoded.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyAdmin;
