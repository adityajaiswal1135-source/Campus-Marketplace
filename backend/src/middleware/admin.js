export const adminGuard = (req, res, next) => {
  // verifyToken must run before this middleware
  // so req.user is guaranteed to exist here
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin access only.',
    });
  }

  next();
};