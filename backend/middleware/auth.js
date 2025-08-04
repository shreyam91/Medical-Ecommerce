// Example authentication middleware
module.exports = (req, res, next) => {
  // Decode JWT or session and attach user info
  // For example purposes, assume it's already done
  // req.user = { id: 1, role: 'admin' }; 
  next();
};
