"use strict";

const router = require("express").Router(), 
authRoutes = require("./authRoutes"), 
testRoutes = require("./testRoutes");

module.exports = (io) => {

    console.log("load module index.js");

    //const prefixRoutes = require("./prefixRoutes")(io);
    
    // router.use("/api/user", (req, res) => {res.send("test /api/user")});
    
  
    // router.use("/api/auth", authRoutes);
    // router.use("/api/test", testRoutes(io));

    router.use("/user", (req, res) => {res.send("test /api/user")});
    
  
    router.use("/auth", authRoutes);
    router.use("/test", testRoutes(io));
    
    return router;
  
  }





