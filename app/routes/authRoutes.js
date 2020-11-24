"use strict";

const router = require("express").Router(),
  { verifySignUp } = require("../middlewares"),
  controller = require("../controllers/auth.controller");


router.post("/signup",
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
  ], controller.signup);
router.post("/signin", controller.signin);
router.get("/test", (req,res)=> res.send("test /api/auth/test") );


module.exports = router;