// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const socketIo = require("socket.io");
// const http = require("http");
//const dbConfig = require("./app/config/db.config.js");
const server = require("./app/server/server");
const dbService = require("./app/dao/db.service");
//



// const app = express();



// var corsOptions = {
//     origin: "http://localhost:8082"
// };

// app.use(cors(corsOptions));

// // parse requests of content-type - application/json
// app.use(bodyParser.json());

// // parse requests of content-type - application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true })); 

// app.use(express.static("public"));
// // simple route
// app.get("/", (req, res) => {
//     res.json({ message: "Welcome to bezkoder application." });
// });


// require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);
// // set port, listen for requests
// const PORT = process.env.PORT || 8080;
// // app.listen(PORT, () => {
// //     console.log(`Server is running on port ${PORT}.`);
// // });

// const server = http.createServer(app);
// const io = socketIo(server);

// let interval;

// io.on("connection", (socket) => {
//   console.log("New client connected");
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(() => getApiAndEmit(socket), 1000);
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//     clearInterval(interval);
//   });
// });
// var i = 0; 
// const getApiAndEmit = socket => {
//   //const response = new Date();

//   // Emitting a new message. Will be consumed by the client
//   socket.emit("FromAPI", i++);
// };

// const db = require("./app/models");
// const Role = db.role;

// db.mongoose
//     .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     })
//     .then(() => {
//         console.log("Successfully connect to MongoDB.");
//         initial();
//     })
//     .catch(err => {
//         console.error("Connection error", err);
//         process.exit();
//     });

// function initial() {
//     Role.estimatedDocumentCount((err, count) => {
//         if (!err && count === 0) {
//             new Role({
//                 name: "user"
//             }).save(err => {
//                 if (err) {
//                     console.log("error", err);
//                 }

//                 console.log("added 'user' to roles collection");
//             });

//             new Role({
//                 name: "moderator"
//             }).save(err => {
//                 if (err) {
//                     console.log("error", err);
//                 }

//                 console.log("added 'moderator' to roles collection");
//             });

//             new Role({
//                 name: "admin"
//             }).save(err => {
//                 if (err) {
//                     console.log("error", err);
//                 }

//                 console.log("added 'admin' to roles collection");
//             });
//         }
//     });
// }

//server.listen(PORT, () => console.log(`Listening on port ${PORT}`));


