const roleAuth = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.admin) {
        return res.redirect("/admin/login");
      }

      const roleHierarchy = {
        super_admin: 3,
        admin: 2,
        editor: 1,
      };

      const userRoleLevel = roleHierarchy[req.admin.role] || 0;
      
      // Convert single role to array for consistent handling
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // Check if user's role level is sufficient for any of the allowed roles
      const hasPermission = roles.some(role => {
        const requiredRoleLevel = roleHierarchy[role] || 0;
        return userRoleLevel >= requiredRoleLevel;
      });

      if (hasPermission) {
        next();
      } else {
        res.status(403).render("admin/error", {
          error: "Access denied. Insufficient permissions.",
          title: "Access Denied",
        });
      }
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).render("admin/error", {
        error: "Internal server error",
        title: "Error",
      });
    }
  };
};

module.exports = roleAuth;
