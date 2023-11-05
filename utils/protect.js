
exports.protect = (req, res, next) => {
    const { authenticated } = req.session;
  
    if (!authenticated) {
      res.sendStatus(401);
    } else {
      next();
    }
  };