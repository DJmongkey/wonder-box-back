const jwt = require("jsonwebtoken");

const user = 

export const isAuth = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!(authHeader && authHeader.startsWith("Bearer "))) {
    return res.status(401).json("인증 문제발생");
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (error, decode) => {
    if (error) {
      return res.status(401).json("인증 문제발생");
    }

    const user = await Use
  })
}
