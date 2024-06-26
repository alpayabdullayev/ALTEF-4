// const jwt = require("jsonwebtoken");

// const authenticate = (req, res, next) => {
//   const token = req.cookies.access_token;

//   if (!token) {
//     return res.status(401).json({ message: "Access token missing" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     if (error.message === "jwt expired") {
//       return res.status(401).json({ message: "jwt expired", code: "TOKEN_EXPIRED" });
//     }
//     return res.status(403).json({ error: "Invalid token" });
//   }
// };

// module.exports = authenticate;

const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access token missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(401).json({ message: "jwt expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;
