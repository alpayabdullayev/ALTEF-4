const checkRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res
        .status(403)
        .json({
          message: "Forbidden: You don't have the required permissions.",
        });
    }
  };
};

module.exports = checkRole;
