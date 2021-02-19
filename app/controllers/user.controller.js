const multer = require('multer');
const db = require("../models");
const IpDb = db.ipDb;
const PrefixIpv4 = db.prefixIpv4;
const PrefixIpv6 = db.prefixIpv6;
const url = require('url');
const fs = require('fs');
const { join } = require('path');
const prefixDAO = require("../dao/prefixIpv4");
const prefixIpv4DAO = require("../dao/prefixIpv4");
const prefixIpv6DAO = require("../dao/prefixIpv6");
const uuid = require('uuid-random');
const deleteIpv4 = require("../helpers/deleteIpv4");
const deleteIpv6 = require("../helpers/deleteIpv6");
const { check, oneOf, validationResult } = require('express-validator');
const { sortSourceIpv4, sortSourceIpv6, generateList, listFailToFile } = require("../helpers/validate")
const ip6addr = require('ip6addr')
const LTT = require('list-to-tree');
const { addressIpv6Validation } = require('../validations/validationPrefixIpv6');
const { addressIpv4Validation } = require('../validations/validationPrefixIpv4');
var bcrypt = require("bcryptjs");
const { user } = require('../models');
const { response } = require('express');
var archiver = require('archiver');
//const db = require("../models");
const User = db.user;
const Role = db.role;
//const  archive = archiver('zip');


// const sortSourceIpv6 = (a, b) => {


//   a = a.prefix_full.split(/[\:,\/]/)
//     .map((value) => parseInt(value, 16));
//   b = b.prefix_full.split(/[\:,\/]/)
//     .map((value) => parseInt(value, 16));



//   return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] || a[5] - b[5] || a[6] - b[6] || a[7] - b[7]


// }

const logIter = async (iter) => {
  console.log(iter)
  // process.nextTick(() => 
  // console.log(iter)
  // );
}

function list_to_tree(list) {
  try {

    var start_ltt = Date.now();

    var map = {}, node, roots = [], i;

    for (i = 0; i < list.length; i += 1) {
      map[list[i].key] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node._doc.parent !== "#") {
        // if you have dangling branches check that map[node.parentId] exists
        list[map[node._doc.parent]].children.push(node);
      } else {
        roots.push(node);
      }
    }

    var end_ltt = Date.now();
    console.log(` Execution iteracja: ${end_ltt - start_ltt} ms`);
    return roots;
  } catch (err) {
    console.log(err)
  }
}

// const generateList = (data, ids) => {
//   for (let i = 0; i < data.length; i++) {
//     const node = data[i];
//     const { _id } = node;
//     ids.push(_id);
//     if (node.children.length > 0) {
//       generateList(node.children, ids);
//     }
//   }
// }

const writeAll = async (array_all, ipVer) => {
  try {
    const items_create = array_all.filter(obj => obj.created == true);
    let i = 0;
    console.log("zapisywanie created");
    if (items_create.length > 0)
      if (ipVer == "ipv4")
        await PrefixIpv4.insertMany(items_create)
      else if (ipVer == "ipv6")
        await PrefixIpv6.insertMany(items_create)
    // items_create.forEach(obj => {
    //   i++;
    //   return obj.save().catch(err => {console.log(err); throw err})
    //}
    //);
    console.log("zapisano created");

    i = 0;
    const items_update = array_all.filter(obj => obj.updated == true && obj.created == null);

    var promises;
    console.log("zapisywanie updated");
    if (items_update.length > 0) {
      promises = items_update.map(obj => {
        // if (obj.prefix === "fda9:b700:1000::/56")
        //   throw "bład przy update fda9:b700:1000::/56 "
        // i++;
        return obj.save()
      });
      await Promise.all(promises);

      console.log("zapisano updated");
    }
    //await Promise.all(promises);
    console.log(" Przetwarzanie po promise ALL ");
    return items_create.length;

    //items_update.forEach(obj =>  PrefixIpv6.findByIdAndUpdate({_id:"6009d9528ca0291c0cc425d8"}, {parent: obj._doc.parent})); 

  } catch (err) {

    console.log(err)
    throw err;

  }

}


// const addressValidationIpv6 = (slines, array_all, array_fail_result) => {

//   if (!helper.ipv6RegExp(sline[0])) {

//     array_fail_result.push(sline[0] + " => " + 'Niepoprawny adres IPv6!')
//     //break;
//     //i_line ++;
//     return false;
//     //throw new Error('Linia zawiera niepoprawny adres IPv6!');
//   }

//   if (!helper.ipCidrTest(sline[0], "ipv6")) {

//     array_fail_result.push(line + " => " + 'Niepoprawny CIDR IPv6!')
//     //break; 
//     //i_line ++;
//     return false;
//     //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
//   }
//   if (array_all.filter(obj => obj.prefix == ip6addr.createCIDR(sline[0]).toString({ format: 'v6' })).length == 1) {

//     array_fail_result.push(sline[0] + " => " + 'Ten prefix juz istnieje')
//     //break; 
//     //i_line ++;
//     //i_line++;
//     //console.log(i_line);
//     //io.emit("loading", ((i_line / array_file.length) * 100)*0.9);
//     return false;
//     //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
//   }

//   return true;


// }




IpDb.on('index', function (err) {
  if (err) console.error(err);
})

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload')
  },
  filename: function (req, file, cb) {
    //cb(null, Date.now() + '-' + file.originalname)
    cb(null, file.originalname)
  }
})

var uploadmulter = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "application/vnd.ms-excel") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .csv format allowed!'));
    }
  }
}).single('file');



module.exports = io => {

  var controler = {};

  controler.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
  };

  controler.userBoard = (req, res) => {

    User.find()
      .populate("roles")
      .then(users => res.status(200).send(users))
      //.populate("roles", "-__v")
      //.populate("roles")
      ;
  };

  controler.createUser = (req, res) => {

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });



    user.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (req.body.roles) {
        Role.find(
          {
            name: { $in: req.body.roles }
          },
          (err, roles) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            user.roles = roles.map(role => role._id);
            user.save(err => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }

              res.send({ message: "User was registered successfully!" });
            });
          }
        );
      } else {
        Role.findOne({ name: "user" }, (err, role) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = [role._id];
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        });
      }
    });

    console.log(req.body)

  };

  controler.editUser = (req, res) => {

    console.log(req.body);

    Role.find(
      {
        name: { $in: req.body.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        let update_obj = {roles: roles.map(role => role._id)};

        if (req.body.changepass == true) {
          const password = bcrypt.hashSync(req.body.password, 8)
          update_obj = { ...update_obj, password }
        };
        User.update({ username: req.body.username }, update_obj)
            .then((response) => { 
              console.log(response)
              res.send({ message: "User was registered successfully!" })
            })
            .catch(err => {
              console.log(err)
              res.status(500).send({ message: err })
                           
          })
      })
    };

  controler.deleteUser = (req, res) => {


        User.deleteOne({ username: req.body.username, email: req.body.email })
          .then(ressponse => {
            console.log(res);
            res.send({ message: "User was dleted successfully!" });
          })
          .catch(err =>
            res.status(500).send({ message: err }))

      };

    controler.adminBoard = (req, res) => {

      res.status(200).send("Admin Content.");
    };

    controler.moderatorBoard = (req, res) => {
      res.status(200).send("Moderator Content.");
    };


    controler.upload = (req, res, next) => {

      uploadmulter(req, res, function (err) {

        console.log(req.file);
        console.log(req.body.ipVer);
        console.log(req.body.dbName);
        if (err instanceof multer.MulterError) {
          return res.status(500).send(err.message)
        } else if (err) {
          return res.status(500).send(err.message)
        }
        // console.log(req.body.file.filename);

        io.emit("validating");
        //io.emit("loading_stop", 100);


        //socket.emit("FromAPI", i++);
        //res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.Trwa iportowanie do bazy  danych.`);
        next();

      })
    }

    controler.importload_new_v3 = async (req, res, next) => {
      try {

        var tablica = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var iter = 0;

        const task = (i) => new Promise((resolve, reject) => resolve(tablica[i]));
        const v = () => console.log("test");
        function delay(t, v) {
          return new Promise(function (resolve) {
            setTimeout(resolve.bind(null, v()), t)
          });
        }

        const iteracja = (v) => delay(1000, v).then(() => {

          iter++;
          io.emit("loading");
          //console.log(io_inst)
          if (iter < tablica.length) {

            iteracja(v)

          }
          else
            console.log("End!!!!")

        })

        iteracja(v);
        res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);


      }
      catch (err) {
        console.log(err);
      }

    }


    controler.importload_new_v2 = async (req, res, next) => {
      try {
        var lines = await fs.readFileSync(`./upload/${req.file.filename}`, 'utf-8')
          .split('\n')
          .filter(Boolean);

        const lines_length = lines.length;

        var array_all;
        let array_fail_result = [];
        if (req.body.ipVer == "ipv4") {
          array_all = await PrefixIpv4.find({ "dbName": req.body.dbName });
          array_all = array_all.sort(sortSourceIpv4)
          addressIpv4Validation(lines, array_all, array_fail_result);
          io.emit("loading_start");
        }
        else if (req.body.ipVer == "ipv6") {
          array_all = await PrefixIpv6.find({ "dbName": req.body.dbName });
          array_all = array_all.sort(sortSourceIpv6)
          //io.emit("validating", 0);
          addressIpv6Validation(lines, array_all, array_fail_result);
          io.emit("loading_start");
        }
        array_all = list_to_tree(array_all);
        var i_line = 0;


        // const iteracjaIpv4 = () =>  prefixIpv4DAO.saveline_v2(lines[i_line].replace(/"/g, "").split(";"), array_all, array_fail_result, req.body.dbName, io)
        //   .then(() => {
        //     i_line++;
        //     if (i_line < lines.length) {

        //       var load_progress = 0.9 * (i_line / lines_length) * 100;
        //       io.emit("loading", load_progress)
        //       //prefixIpv6DAO.saveLine(lines[i_line].replace(/"/g, "").split(";"),array_all,array_fail_result,req.body.dbName) 
        //       iteracjaIpv4()
        //     }
        //     else {
        //       //console.log("Załadowan wszystkie !!!")

        //       //var end_iteracja = Date.now();
        //       //console.log(` Execution iteracja: ${end_iteracja - start_iteracja} ms`);
        //       const list_to_write = []
        //       generateList(array_all, list_to_write);
        //       //console.log(`list to write = ${list_to_write}`)




        //     }
        //   })
        //   .then(() => {
        //     const list_to_write = []
        //     generateList(array_all, list_to_write);
        //     return writeAll(list_to_write, req.body.ipVer);
        //   }).then(result => {



        //     // if(!only_one){
        //     io.emit("loading", (99));

        //     //loading = false;
        //     //console.log("loading = " + loading);

        //     const raport_uuid = listFailToFile(array_fail_result)
        //     // var raport_uuid = uuid();
        //     // var raport_path = "./upload/" + raport_uuid + ".txt";

        //     // var file = fs.createWriteStream(raport_path);
        //     // file.on('error', function (err) { console.log("nie mogę znaleźć ../uploads/") });
        //     // array_fail_result && array_fail_result.forEach(function (v) { file.write(v); });
        //     // file.end();

        //     var myBox = {
        //       uuid: raport_uuid,
        //       lines: lines_length,
        //       success: result

        //     }

        //     io.emit("loading_done", myBox);

        //     res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);
        //   }).catch((err) => {
        //     //console.log(err)
        //     //console.log("Proble with loadig prefixes to DB. Error:" + err.message);
        //     err.message = "Proble with loadig prefixes to DB. Error:" + err.message;
        //     return res.status(500).send(err.message);
        //     //throw err
        //   });


        const iteracjaIpv4 = async () => {

          for (let iter = 0; iter < lines.length; iter++) {

            await prefixIpv4DAO.saveline_v2(lines[iter].replace(/"/g, "").split(";"), array_all, array_fail_result, req.body.dbName, io);
            var load_progress = 0.9 * (iter / lines_length) * 100;
            io.emit("loading", load_progress)

          }

        }


        const iteracjaIpv6 = async () => {

          for (let iter = 0; iter < lines.length; iter++) {

            await prefixIpv6DAO.saveline_v2(lines[iter].replace(/"/g, "").split(";"), array_all, array_fail_result, req.body.dbName, io);
            var load_progress = 0.9 * (iter / lines_length) * 100;
            io.emit("loading", load_progress)

          }

        }



        var start_iteracja = Date.now();
        //console.log(` i = ${i}; Execution time in while: ${end_in - start_in} ms`);
        if (lines.length > 0) {

          if (req.body.ipVer == "ipv4")
            await iteracjaIpv4();
          else if (req.body.ipVer == "ipv6")
            await iteracjaIpv6();
          else
            throw "Nieporawna wartość ipVer."
        }
        else {
          const raport_uuid = listFailToFile(array_fail_result);
          var myBox = {
            uuid: raport_uuid,
            lines: lines_length,
            success: 0

          }

          io.emit("loading_done", myBox);

          res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);
          return

        }

        // .then(() => {
        const list_to_write = []
        generateList(array_all, list_to_write);
        return writeAll(list_to_write, req.body.ipVer)
          .then(result => {



            // if(!only_one){
            io.emit("loading", (99));

            //loading = false;
            //console.log("loading = " + loading);

            const raport_uuid = listFailToFile(array_fail_result)
            // var raport_uuid = uuid();
            // var raport_path = "./upload/" + raport_uuid + ".txt";

            // var file = fs.createWriteStream(raport_path);
            // file.on('error', function (err) { console.log("nie mogę znaleźć ../uploads/") });
            // array_fail_result && array_fail_result.forEach(function (v) { file.write(v); });
            // file.end();

            var myBox = {
              uuid: raport_uuid,
              lines: lines_length,
              success: result

            }

            io.emit("loading_done", myBox);

            res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);
          }).catch((err) => {
            //console.log(err)
            //console.log("Proble with loadig prefixes to DB. Error:" + err.message);
            err.message = "Proble with loadig prefixes to DB. Error:" + err.message;
            return res.status(500).send(err.message);
            //throw err
          });

      } catch (err) {

        loading = false;
        console.log("Problem with loadig prefixes to DB. Error:" + err.message);
        return res.status(500).send(err.message);

      }

    }



    controler.importloadIpv6_new_v2 = async (req, res, next) => {
      try {
        var lines = await fs.readFileSync(`./upload/${req.file.filename}`, 'utf-8')
          .split('\n')
          .filter(Boolean);

        const lines_length = lines.length;

        var array_all = await PrefixIpv6.find({ "dbName": req.body.dbName });
        let array_fail_result = [];
        addressIpv6Validation(lines, array_all, array_fail_result);
        array_all = list_to_tree(array_all);
        var i_line = 0;



        const iteracja = () => prefixIpv6DAO.saveline_v2(lines[i_line].replace(/"/g, "").split(";"), array_all, array_fail_result, req.body.dbName, io)
          .then(() => {
            i_line++;
            if (i_line < lines.length) {

              var load_progress = 0.9 * (i_line / lines_length) * 100;
              io.emit("loading", load_progress)
              //prefixIpv6DAO.saveLine(lines[i_line].replace(/"/g, "").split(";"),array_all,array_fail_result,req.body.dbName) 
              iteracja()
            }
            else {
              //console.log("Załadowan wszystkie !!!")

              //var end_iteracja = Date.now();
              //console.log(` Execution iteracja: ${end_iteracja - start_iteracja} ms`);
              const list_to_write = []
              generateList(array_all, list_to_write);
              //console.log(`list to write = ${list_to_write}`)




            }
          })
          .then(() => {
            const list_to_write = []
            generateList(array_all, list_to_write);
            return writeAll(list_to_write, array_fail_result, io);
          }).then(result => {



            // if(!only_one){
            io.emit("loading", (99));

            //loading = false;
            //console.log("loading = " + loading);

            const raport_uuid = listFailToFile(array_fail_result)
            // var raport_uuid = uuid();
            // var raport_path = "./upload/" + raport_uuid + ".txt";

            // var file = fs.createWriteStream(raport_path);
            // file.on('error', function (err) { console.log("nie mogę znaleźć ../uploads/") });
            // array_fail_result && array_fail_result.forEach(function (v) { file.write(v); });
            // file.end();

            var myBox = {
              uuid: raport_uuid,
              lines: lines_length,
              success: result

            }

            io.emit("loading_done", myBox);

            res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);
          }).catch((err) => {
            //console.log(err)
            //console.log("Proble with loadig prefixes to DB. Error:" + err.message);
            err.message = "Proble with loadig prefixes to DB. Error:" + err.message;
            return res.status(500).send(err.message);
            //throw err
          });

        var start_iteracja = Date.now();
        //console.log(` i = ${i}; Execution time in while: ${end_in - start_in} ms`);
        if (lines.length > 0)
          iteracja();
        else {
          const raport_uuid = listFailToFile(array_fail_result);
          var myBox = {
            uuid: raport_uuid,
            lines: lines_length,
            success: 0

          }

          io.emit("loading_done", myBox);

          res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);

        }

      } catch (err) {

        loading = false;
        console.log("Proble with loadig prefixes to DB. Error:" + err.message);
        return res.status(500).send(err.message);

      }

    }

    controler.importload_new = async (req, res, next) => {
      try {
        var lines = await fs.readFileSync(`./upload/${req.file.filename}`, 'utf-8')
          .split('\n')
          .filter(Boolean);

        var result = await prefixIpv6DAO.saveLines(lines, req.body.dbName, io);

        //console.log("report = " + report);
        loading = false;
        console.log("loading = " + loading);
        var raport_uuid = uuid();
        var raport_path = "./upload/" + raport_uuid + ".txt";

        var file = fs.createWriteStream(raport_path);
        file.on('error', function (err) { console.log("nie mogę znaleźć ../uploads/") });
        result.report && result.report.forEach(function (v) { file.write(v); });
        file.end();

        var myBox = {
          uuid: raport_uuid,
          lines: lines.length,
          success: result.created

        }

        //io.emit("loading_done");

        io.emit("loading_done", myBox);


        //console.log("!!!! susses = " + success);

        res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);


      } catch (err) {

        loading = false;
        console.log("Proble with loadig prefixes to DB. Error:" + err.message);
        return res.status(500).send(err.message);

      }

    }
    ///
    controler.importload = async (req, res, next) => {

      try {
        var loading = false;
        var lines = await fs.readFileSync(`./upload/${req.file.filename}`, 'utf-8')
          //console.log(process.cwd());
          //var lines = await fs.readFileSync('100-pref.csv', 'utf-8')
          .split('\n')
          .filter(Boolean);
        console.log("Odcztano plik ");
        console.log("Odcztano plik  test");
        console.log("check lines" + "loading = " + loading);

        loading = true;
        console.log("loading = " + loading);


        io.emit("loading_start");

        var success = 0;

        var report = [];

        var ver = req.body.ipVer;
        var i_line = 0;
        for (var line of lines) {

          if (ver == "ipv4")
            var save_result = await prefixDAO.saveAddress(line, req.body.dbName);
          if (ver == "ipv6")
            var save_result = await prefixIpv6DAO.saveAddress(line, req.body.dbName);


          if (save_result[0] == 1) {
            success++;
          }
          else {

            report.push(line.trim() + "----> Not added. Reason:" + save_result[1] + "\n");

          }
          i_line++;



          io.emit("loading", (i_line / lines.length) * 100);



        }
        //io.emit("loading_done", "test");
        console.log("report = " + report);
        loading = false;
        console.log("loading = " + loading);
        var raport_uuid = uuid();
        var raport_path = "./upload/" + raport_uuid + ".txt";

        var file = fs.createWriteStream(raport_path);
        file.on('error', function (err) { console.log("nie mogę znaleźć ../uploads/") });
        report.forEach(function (v) { file.write(v); });
        file.end();

        var myBox = {
          uuid: raport_uuid,
          lines: lines.length,
          success: success

        }

        //io.emit("loading_done");

        io.emit("loading_done", myBox);


        console.log("!!!! susses = " + success);

        res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.`);


      }
      catch (err) {

        loading = false;
        console.log("Proble with loadig prefixes to DB. Error:" + err.message);
        return res.status(500).send(err.message);

      }
    },

      controler.json = (req, res, next) => {

        if (req.query.ver == "ipv4") {

          PrefixIpv4.find({ dbName: req.query.dbName })
            //.map(x => x = toClient1(x))
            .then(prefixes => {
              //console.log(prefixes.toJson());
              res.locals.prefixes = prefixes.sort(sortSourceIpv4);
              //res.locals.tbjson = testjson;
              next();
            })
            .catch(error => {
              console.log(`Error fetching course by ID: ${error.message}`);
              next(error);
            });
        }
        else {
          //let courseId = req.params.id;
          var startFetch = Date.now();
          PrefixIpv6.find({ dbName: req.query.dbName })
            //.map(x => x = toClient1(x))
            .then(prefixes => {
              var endFetch = Date.now();
              console.log(` Execution fetching from DB: ${endFetch - startFetch} ms`);

              //   var ltt = new LTT(prefixes, {
              //     key_id: 'id',
              //     key_parent: 'parent'
              // });

              //console.log(prefixes.toJson());
              //res.locals.prefixes = prefixes;

              //res.locals.prefixes = list_to_tree(prefixes);
              var startSorting = Date.now();
              res.locals.prefixes = prefixes.sort(sortSourceIpv6);
              var endSorting = Date.now();
              console.log(` Execution sorting list: ${endSorting - startSorting} ms`);


              //res.locals.tbjson = testjson;
              next();
            })
            .catch(error => {
              console.log(`Error fetching course by ID: ${error.message}`);
              next(error);
            });
        }
      }

    controler.showView = (req, res) => {

      /*res.json({
        status: httpStatus.OK,
        data: res.locals.prefixes
      });*/

      res.send(res.locals.prefixes);
      //res.send(res.locals.tbjson);
    }
    ///

    controler.backupDbs = async (req, res) => {

      try{

        const  archive = archiver('zip');

        const path = "./backup"
        const output = fs.createWriteStream('./upload/backup.zip');
        output.on('close', function () {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      
      archive.on('error', function(err){
          throw err;
      });


        fs.readdirSync(path)
          .map(name => join(path, name))
          .map(file => fs.unlinkSync(file));

        //console.log(process.cwd());
        //console.log(req.body);
        var base;
        for(let i = 0; i< req.body.length; i++) {

          var obj = req.body[i]
        
        if(obj.type == "ipv4")
        {
         base =   await PrefixIpv4.find({"dbName": obj.subType})
        }
        else if(obj.type == "ipv6")
        {
         base =  await PrefixIpv6.find({"dbName": obj.subType})
        }



        var file = fs.createWriteStream("./backup/"+ obj.subType+ "_" + obj.type );
        file.on('error', function (err) { console.log("nie mogę znaleźć ../uploads/") });
        base.length>0 && base.forEach(function (v) { file.write(`${v.prefix};${v.description};${v.tag};\n`); });
        //file.write("test");
        file.end();
        }

        archive.pipe(output);
        archive.directory(path, false);
        archive.finalize();
        
        console.log("test")
        res.status(200).send("ok")



      }
      catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);

      }



    }


    controler.addDbs = (req, res) => {
      try {

        IpDb.findOne({ type: req.body.type, subType: req.body.subType }, (err, ipdb) => {

          if (err) {
            res.status(500).send(err.message);
            return;
          }

          if (ipdb) {
            res.status(500).send(`Baza o nazwie ${req.body.nameDb} już isnieje. Proszę podać inną nazwę.`);
            return;
          }


          console.log(req.body);
          const ipDb = new IpDb({
            type: req.body.type,
            subType: req.body.subType,
            description: req.body.description
          });

          // let error = ipDb.validateSync();
          // console.log(error);



          ipDb.save(err => {
            if (err) {
              res.status(500).send(err.message);
              return;
            }

            res.send({ message: `Zapisano bazę danych ${req.body.subType}` });
          });
        })

      }
      catch (err) {

        res.status(500).send(err.message);

      }




    }



    controler.editDbs = (req, res) => {
      try {

        // IpDb.findOne({ type: req.body.type, subType: req.body.subType }, (err, ipdb) => {

        //   if (err) {
        //     res.status(500).send(err.message);
        //     return;
        //   }

        //   if (ipdb) {
        //     res.status(500).send(`Baza o nazwie ${req.body.nameDb} już isnieje. Proszę podać inną nazwę.`);
        //     return;
        //   }


        //   console.log(req.body);
        //   const ipDb = new IpDb({
        //     type: req.body.type,
        //     subType: req.body.subType,
        //     description: req.body.description
        //   });

          // let error = ipDb.validateSync();
          // console.log(error);

          IpDb.update({type: req.body.type,subType: req.body.subType}, {description: req.body.description})
              .then((response) => res.send({ message: `Zapisano bazę danych ${req.body.subType}` }) )
              .catch(err => res.status(500).send(err.message));

      

      }
      catch (err) {

        res.status(500).send(err.message);

      }




    }

    controler.deleteDbs = (req, res) => {
      try {


        if(req.body.type == "ipv4")
        {

          PrefixIpv4.deleteMany({dbName: req.body.subType})
                    .then( (result) => IpDb.deleteOne({type: req.body.type, subType: req.body.subType}))
                    .then( (result) =>  res.send({ message: `Usunięto bazę danych ${req.body.subType}` }))
                    .catch(err => res.status(500).send(err.message)) 
        }
        else if(req.body.type == "ipv6") 
        {
          PrefixIpv6.deleteMany({dbName: req.body.subType})
          .then( (result) => IpDb.deleteOne({type: req.body.type, subType: req.body.subType}))
          .then( (result) => res.send({ message: `Usunięto bazę danych ${req.body.subType}` }))
          .catch(err => res.status(500).send(err.message)) 

        }
        else
        {

        res.send({ message: `Nie odnaleziono bazy ${req.body.subType}` })
        }
      

      }
      catch (err) {

        res.status(500).send(err.message);

      }




    }

    controler.getDbs = (req, res) => {

      //IpDb.find({type: req.query.type })
      if (req.query.type == "both") {

        IpDb.find().
          then((dbs, err) => {

            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            deb_res = [
              {
                title: "Bazy IPv4",
                key: "ipv4",
                children: dbs.filter(obj => obj.type == "ipv4")
              },
              {
                title: "Bazy IPv6",
                key: "ipv6",
                children: dbs.filter(obj => obj.type == "ipv6")
              }

            ]

            res.send(deb_res);


            //res.status(200).send(dbs);

          })


      }

      else {


        IpDb.find({ type: req.query.type }).
          then((dbs, err) => {

            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.status(200).send(dbs);

          })

      };
    }

    //   controler.importpost = async (req, res, next) => {


    //     try {
    //         if (!req.files) {
    //             res.send({
    //                 status: false,
    //                 message: 'No file uploaded'
    //             });


    //         }
    //         else if (req.files.avatar.mimetype != "application/vnd.ms-excel") {
    //             res.send({
    //                 status: false,
    //                 message: 'Not corect file extension.Only csv files are accepted'
    //             });
    //         }

    //         else if (req.files.avatar.size > maxSize) {
    //             res.send({
    //                 status: false,
    //                 message: 'Uploaded file is too big. Max size in 1MB'
    //             });

    //         }

    //         else {
    //             //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
    //             let my_file = req.files.avatar;

    //             //Use the mv() method to place the file in upload directory (i.e. "uploads")
    //             //my_file.mv('./uploads/' + my_file.name);




    //             //send response
    //             res.send({
    //                 status: true,
    //                 message: 'File is uploaded',
    //                 data: {
    //                     name: my_file.name,
    //                     mimetype: my_file.mimetype,
    //                     size: my_file.size
    //                 }
    //             });

    //             my_file.mv('./uploads/avatar.csv', next);

    //         }
    //     } catch (err) {
    //         res.status(500).send(err);
    //     }
    // };

    controler.raportDownload = (req, res) => {
      let filename = req.params.id;
      const file = `${__dirname}/../../upload/` + filename;
      res.download(file);
    }

    controler.backupDownload = (req, res) => {
      //let filename = req.params.id;
      const file = `${__dirname}/../../upload/backup.zip`;
      res.download(file);
    }

    controler.multiupdate = async (req, res, next) => {
      try {

        console.log("req.body");
        console.log(req.body);

        const prefixes = req.body.prefixes;
        const ipVer = req.body.ipVer;
        const dbName = req.body.dbName;



        //(req.body).forEach(obj => console.log(obj)); 

        //console.log(obj[0]);
        //console.log(obj[1]);

        //var jsonData = JSON.parse(req.body);
        var no_prefix = 0;
        var result;
        for (item of prefixes) {
          // console.log(req.body[i]);
          // var data = req.body[i];

          if (ipVer == "ipv4")
            result = await PrefixIpv4.updateOne({ prefix: item.prefix, dbName: dbName }, { tag: item.tag, description: item.description });
          else if (ipVer == "ipv6")
            result = await PrefixIpv6.updateOne({ prefix: item.prefix, dbName: dbName }, { tag: item.tag, description: item.description });
          console.log(result);
          if (result.ok = 1)
            no_prefix++;
        }

        //throw 'Wystąpił bład!!!';

        res.send({
          status: true,
          no_prefix: no_prefix,
          message: 'Prefixes updated!!!'
        });

        //res.redirect("/tree");
      }
      catch (e) {

        res.send({
          status: false,
          no_prefix: no_prefix,
          message: e
        });

        console.log(e)

      }

    };


    controler.update = async (req, res, next) => {
      try {

        console.log("edit req.body");
        console.log(req.body);

        // var data = JSON.parse(req.body);
        const data = req.body;
        const ipVer = req.body.ipVer;
        const dbName = req.body.dbName;
        var result;

        if (ipVer == "ipv4")
          result = await PrefixIpv4.updateOne({ prefix: data.prefix, dbName: dbName }, { description: data.desc, tag: data.tag });
        else if (ipVer == "ipv6")
          result = await PrefixIpv6.updateOne({ prefix: data.prefix, dbName: dbName }, { description: data.desc, tag: data.tag });
        console.log(`result = ${result}`);

        res.send({
          status: true,
          message: 'Prefixes updated!!!'
        });

      }
      catch (e) {

        res.send({
          status: false,
          message: e.message
        });

        console.log(e.message);

      }
    }

    controler.delete = async (req, res, next) => {
      try {

        var ids = [];

        console.log("edit req.body");
        console.log(req.body);

        //deleted.restartIds();

        if (req.body.delete_with_children == false) {

          console.log(req.body.data);

          if (req.body.ipVer === "ipv4") {
            var del_prefix = await PrefixIpv4.findOne({ _id: req.body._id });
            var update_child = await PrefixIpv4.updateMany({ parent: del_prefix.prefix, dbName: req.body.dbName }, { parent: del_prefix.parent });
            var deletetresult = await PrefixIpv4.deleteOne({ _id: del_prefix._id });
          }
          else if (req.body.ipVer === "ipv6") {
            var del_prefix = await PrefixIpv6.findOne({ _id: req.body._id });
            var update_child = await PrefixIpv6.updateMany({ parent: del_prefix.prefix, dbName: req.body.dbName }, { parent: del_prefix.parent });
            var deletetresult = await PrefixIpv6.deleteOne({ _id: del_prefix._id });
          }


          //console.log(update_child);
          //console.log(deletetresult);

          res.send({
            status: true,
            message: 'Prefixe deleted!!!'
          });


        }
        else {

          if (req.body.ipVer === "ipv4")
            var resultdel = await deleteIpv4.takeChild(req.body._id, ids, req.body.dbName);
          else if (req.body.ipVer === "ipv6") {

            var dbList = await PrefixIpv6.find({ dbName: req.body.dbName });

            //const deleteElement = list_to_tree(dbList)

            const deleteElement = dbList.filter(item => {

              console.log(item._id._id)
              console.log(item.prefix == req.body.prefix)

              return item._id == req.body._id
            })

            list_to_tree(dbList);
            generateList(deleteElement, ids)

            //var resultdel = await deleteIpv6.takeChild(req.body._id, ids, req.body.dbName);
          }

          if (ids.length > 0) {
            if (req.body.ipVer === "ipv4")
              var deletetresult = await PrefixIpv4.deleteMany({
                _id: ids
              });
            else if (req.body.ipVer === "ipv6")
              var deletetresult = await PrefixIpv6.deleteMany({
                _id: ids
              });

          }

          console.log(deletetresult);
          res.send({
            status: true,
            message: 'Prefixes deleted!!!'
          });
        }
      }
      catch (e) {

        res.send({
          status: false,
          message: e.message
        });
      }
    }


    controler.createipv4 = async (req, res, next) => {

      try {
        var errors = validationResult(req).array().map(e => e.msg);
        //await prefixDAO.saveAddress("1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32");
        if (errors.length > 0) {
          //req.flash('error', errors[0]);
          res.status(400).send({
            status: false,
            message: errors[0]
          });
          //res.redirect('/prefix/new');
        }
        else {

          prefixDAO.saveAddress(`${req.body.prefix.trim()};;;${req.body.description.trim()};${req.body.tag.trim()};;;;`, req.body.dbName);
          res.send({
            status: true,
            message: 'Prefixes updated!!!'
          });
        }
      }
      catch (e) {

        res.send({
          status: false,
          message: e.message
        });

      }
    };




    controler.createipv6 = async (req, res, next) => {

      try {
        var errors = validationResult(req).array().map(e => e.msg);
        //await prefixDAO.saveAddress("1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32", "1.2.3.4/32");
        if (errors.length > 0) {
          //req.flash('error', errors[0]);
          res.send({
            status: false,
            message: errors[0]
          });
          //res.redirect('/prefix/new');
        }
        else {

          var array_all = await PrefixIpv6.find({ "dbName": req.body.dbName });
          array_all = list_to_tree(array_all);
          let array_fail_result = [];
          let list_to_write = [];
          prefixIpv6DAO.saveline_v2(`${req.body.prefix.trim()};;;${req.body.description.trim()};${req.body.tag.trim()};;;;`.replace(/"/g, "").split(";"), array_all, array_fail_result, req.body.dbName, io)
            .then(() => {
              generateList(array_all, list_to_write);
              //console.log(`list to write = ${list_to_write}`)
              writeAll(list_to_write, io, true)

              res.send({
                status: true,
                message: 'Prefixes updated!!!'
              });
            }
            )
            .catch(err => {
              console.log(err)
              res.send({
                status: false,
                message: e.message
              });

            })




        }
      }
      catch (err) {
        console.log(err)
        res.send({
          status: false,
          message: e.message
        });


      }



      //res.redirect('/tree');
    };




    return controler;




  }




//   exports.upload =  (req, res, function (err) {

//     console.log(req.file)
//      if (err instanceof multer.MulterError) {
//           res.status(500).json(err)
//      } else if (err) {
//           res.status(500).json(err)
//      }
//     // console.log(req.body.file.filename);
//  res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.Trwa iportowanie do bazy  danych.`)

// })