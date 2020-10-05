"use strict";

const router = require("express").Router(),
  { verifySignUp } = require("../middlewares"),
  controller = require("../controllers/auth.controller");


router.post("/api/auth/signup",
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
  ], controller.signup);
router.post("/api/auth/signin", controller.signin);



module.exports = router;