const router = require("express").Router();
const c = require("../controllers/media.controller");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader } = require("../middleware/upload");

const staff = [requireAuth, requireRole("superadmin", "admin", "staff")];

router.get("/", staff, c.list);
router.delete("/:id", staff, c.remove);

router.post("/:folder", staff, (req, res, next) => {
  const uploader = makeUploader(req.params.folder || "general");
  uploader.array("files", 10)(req, res, next);
}, c.upload);

module.exports = router;
