"use strict";

const router = require("express").Router(), 
authRoutes = require("./authRoutes"), 
testRoutes = require("./testRoutes");

module.exports = (io) => {

    //const prefixRoutes = require("./prefixRoutes")(io);
  
    router.use("/api/auth", authRoutes);
    router.use("/api/test", testRoutes);
    
    return router;
  
  }





