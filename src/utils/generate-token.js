const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.ACCESS_SECRET_TOKEN,
    {
      expiresIn: '1h' 
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.REFRESH_SECRET_TOKEN,
    {
      expiresIn: '30d' 
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
