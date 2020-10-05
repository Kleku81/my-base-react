const { authJwt } = require("../middlewares"),
    controller = require("../controllers/user.controller"),
     router = require("express").Router();
     



router.get("/api/test/all",controller.allAccess);
router.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
router.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );
router.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  router.post('/upload', controller.upload)





module.exports = router;
