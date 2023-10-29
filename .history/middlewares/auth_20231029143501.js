const jwt = require("jsonwebtoken");

export const isAuth = async (req, res, next) => {
  const authHeader = req.get("Au")
}
