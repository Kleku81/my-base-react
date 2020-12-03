const multer = require('multer');
const db = require("../models");
const IpDb = db.ipDb;
const PrefixIpv4 = db.prefixIpv4;
const PrefixIpv6 = db.prefixIpv6;
const url = require('url');
const fs = require('fs');
const prefixDAO = require("../dao/prefixIpv4");
const prefixIpv6DAO = require("../dao/prefixIpv6");
const uuid = require('uuid-random');
const deleteIpv4 = require("../helpers/deleteIpv4");
const deleteIpv6 = require("../helpers/deleteIpv6");
const { check, oneOf, validationResult } = require('express-validator');

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
    if (file.mimetype == "application/vnd.ms-excel!") {
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
    res.status(200).send("User Content.");
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

      io.emit("loading_start", "test emit loading data");
      io.emit("loading_stop", 100);


      //socket.emit("FromAPI", i++);
      //res.status(200).send(`Zapisano na serwerze plik ${req.file.filename}.Trwa iportowanie do bazy  danych.`);
      next();

    })
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

        if(ver == "ipv4")
        var save_result = await prefixDAO.saveAddress(line, req.body.dbName);
        if(ver == "ipv6")
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

      if(req.query.ver == "ipv4")
      {
      PrefixIpv4.find({ dbName: req.query.dbName })
        //.map(x => x = toClient1(x))
        .then(prefixes => {
          //console.log(prefixes.toJson());
          res.locals.prefixes = prefixes;
          //res.locals.tbjson = testjson;
          next();
        })
        .catch(error => {
          console.log(`Error fetching course by ID: ${error.message}`);
          next(error);
        });
      }
      else{
      //let courseId = req.params.id;
      PrefixIpv6.find({ dbName: req.query.dbName })
        //.map(x => x = toClient1(x))
        .then(prefixes => {
          //console.log(prefixes.toJson());
          res.locals.prefixes = prefixes;
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


  controler.addDbs = (req, res) => {
    try {

      IpDb.findOne({ type: req.body.ipVer, subType: req.body.nameDb }, (err, ipdb) => {

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
          type: req.body.ipVer,
          subType: req.body.nameDb,
          description: req.body.descDb
        });

        // let error = ipDb.validateSync();
        // console.log(error);



        ipDb.save(err => {
          if (err) {
            res.status(500).send(err.message);
            return;
          }

          res.send({ message: `Zapisano bazę danych ${req.body.nameDb}` });
        });
      })

    }
    catch (err) {

      res.status(500).send(err.message);

    }




  }

  controler.getDbs = (req, res) => {

    //IpDb.find({type: req.query.type })
    IpDb.find({ type: req.query.type }).
      then((dbs, err) => {

        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.status(200).send(dbs);

      })

  };

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

       if(ipVer=="ipv4")
       result = await PrefixIpv4.updateOne({ prefix: item.prefix, dbName: dbName }, { tag: item.tag, description: item.description });
       else if(ipVer=="ipv6")
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

        if(req.body.ipVer === "ipv4"){
        var del_prefix = await PrefixIpv4.findOne({ _id: req.body._id });
        var update_child = await PrefixIpv4.updateMany({ parent: del_prefix.prefix, dbName: req.body.dbName }, { parent: del_prefix.parent });
        var deletetresult = await PrefixIpv4.deleteOne({ _id: del_prefix._id });
        }
        else if(req.body.ipVer === "ipv6"){
          var del_prefix = await PrefixIpv6.findOne({ _id: req.body._id });
          var update_child = await PrefixIpv6.updateMany({ parent: del_prefix.prefix, dbName: req.body.dbName }, { parent: del_prefix.parent });
          var deletetresult = await PrefixIpv6.deleteOne({ _id: del_prefix._id });
          }


        console.log(update_child);
        console.log(deletetresult);

        res.send({
          status: true,
          message: 'Prefixe deleted!!!'
        });


      }
      else {

        if(req.body.ipVer==="ipv4")
        var resultdel = await deleteIpv4.takeChild(req.body._id, ids);
        else if(req.body.ipVer==="ipv6")
        var resultdel = await deleteIpv6.takeChild(req.body._id, ids);
        if (resultdel == 1) {
          if(req.body.ipVer==="ipv4")
          var deletetresult = await PrefixIpv4.deleteMany({
            _id: ids
          });
          else if(req.body.ipVer==="ipv6")
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



        prefixIpv6DAO.saveAddress(`${req.body.prefix.trim()};;;${req.body.description.trim()};${req.body.tag.trim()};;;;`, req.body.dbName);
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