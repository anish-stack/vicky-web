const { User } = require("../models");
const { ADMIN_ROLES } = require("./adminMiddleware");

/**
 * Use after authMiddleware. Lets a user act on their own record (req.params.id)
 * and lets admins act on any record.
 */
const selfOrAdmin = async (req, res, next) => {
  try {
    if (String(req.user?.id) === String(req.params.id)) return next();
    const actor = await User.findByPk(req.user?.id, { attributes: ["id", "role"] });
    if (actor && ADMIN_ROLES.includes(actor.role)) {
      req.user.role = actor.role;
      return next();
    }
    return res.status(403).json({ status: false, message: "Forbidden" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = selfOrAdmin;
