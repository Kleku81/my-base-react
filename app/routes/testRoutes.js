const { authJwt } = require("../middlewares"),
  controller = require("../controllers/user.controller"),
  router = require("express").Router();
const { body, check, oneOf, validationResult } = require('express-validator');
//const PrefixIpv4 = require("../models/prefixIpv4.js");
//const PrefixIpv6 = require("../models/prefixIpv6.js");
const {ipCidrTest, existsPrefix } = require("../helpers/validate");


module.exports = (io) => {

  const controller = require("../controllers/user.controller")(io);

  router.get("/all", controller.allAccess);
  router.get("/user", [authJwt.verifyToken], controller.userBoard);
  router.get(
    "/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );
  router.get(
    "/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  // router.post(
  //   "/create",
  //   //prefixController.validate,
  //   [
  //     check("prefix")
  //       //.then((v) => {consoe.log(v); return v})
  //       .trim()
  //       .matches(/^((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([0-9]|[12][0-9]|3[0-2]))$)/)
  //       .withMessage('Not valid adress')

  //       //.custom( value => {  {if(helper.ipv4CidrTest(value) == false) {throw new Error('Linia zawiera niepoprawny CIDR IPv4!')}}})
  //       .custom(value => { console.log(`ipVer= ${req.body.ipVer}`); helper.ipCidrTest(value, body('ipVer')) })
  //       .withMessage('Incorrect CIDR !')
  //       .custom(() => {
  //         return PrefixIpv4.findOne({ prefix: body('prefix'), dbName: body('dbName') })
  //           .then(prefix => { if (prefix != null) { throw new Error('This prefix already exist') } })
  //       })

  //   ],
  //   controller.create
  //   //prefixController.redirectView
  // );

  router.post('/upload',[authJwt.verifyToken, authJwt.isModerator], controller.upload, controller.importload_new_v2);
  router.post('/dbs',[authJwt.verifyToken, authJwt.isModerator], controller.addDbs);
  router.get('/dbs',[authJwt.verifyToken] ,controller.getDbs);
  router.get('/tree',/*[authJwt.verifyToken],*/ controller.json, controller.showView);
  router.get('/raport/:id',[authJwt.verifyToken],  controller.raportDownload);
  router.patch('/multiedit',[authJwt.verifyToken, authJwt.isModerator],controller.multiupdate);
  router.patch('/edit',[authJwt.verifyToken, authJwt.isModerator], controller.update);
  router.delete('/delete',[authJwt.verifyToken, authJwt.isModerator],  controller.delete);

  router.post('/ipv4',
  [
    check("prefix")
      //.then((v) => {consoe.log(v); return v})
      .trim()
      .matches(/^((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([0-9]|[12][0-9]|3[0-2]))$)/)
      .withMessage('Niepoprawny adres!')

      //.custom( value => {  {if(helper.ipv4CidrTest(value) == false) {throw new Error('Linia zawiera niepoprawny CIDR IPv4!')}}})
      .custom(value => ipCidrTest(value, "ipv4"))
      .withMessage('Niepoprawny CIDR !')
      .custom(async ( value, { req }) => {
        const test = await existsPrefix(value, req.body.dbName, "ipv4");
        //console.log(`test= ${test}`);
        return test;
      })
      .withMessage('Ten prefix już isnieje !')

  ],

  controller.createipv4);



  router.post('/ipv6',
    [
      check("prefix")
        //.then((v) => {consoe.log(v); return v})
        .trim()
        .matches(/^((([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/([0-9]|[1-9][0-9]|1[0-2][0-8])$)/)
        .withMessage('Not valid adress')

        //.custom( value => {  {if(helper.ipv4CidrTest(value) == false) {throw new Error('Linia zawiera niepoprawny CIDR IPv4!')}}})
        .custom(value => ipCidrTest(value, "ipv6"))
        .withMessage('Incorrect CIDR !')
        .custom(async ( value, { req }) => {
          const test = await existsPrefix(value, req.body.dbName, "ipv6");
          //console.log(`test= ${test}`);
          return test;
        })
        .withMessage('Ten prefix już isnieje !')

    ],

    controller.createipv6);







  return router;

}
