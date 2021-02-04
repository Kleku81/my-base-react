const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
const morgan = require("morgan");
const path = require('path');


const app = express();



var corsOptions = {
    origin: "http://localhost:8082"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));
//app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'build')));
// simple route


//require('../app/routes/auth.routes')(app);
//require('../app/routes/user.routes')(app);
//require('../routes/auth.routes')(app);
//require('../routes/user.routes')(app);
// set port, listen for requests
const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}.`);
// });

const server = http.createServer(app);
const io = socketIo(server, {pingInterval: 600000});

let interval;

io.on("connection", (socket) => {
    console.log("New client connected");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 10000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});
var i = 0;
const getApiAndEmit = socket => {
    //const response = new Date();

    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", i++);
};

// app.get('/', function (req, res) {
//     res.sendFile(path.join("public", 'build', 'index.html'));
//   });

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });


const router = require("../routes/index")(io);
app.use("/api", router);
// app.get("/", (req, res) => {
//     res.json({ message: "Welcome to bezkoder application." });
// });

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

