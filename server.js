const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
}

app.use("/peerjs", ExpressPeerServer(server, opinions));
// Serve static files
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
    // console.log("IDDDD")
  res.redirect(`/${uuidv4()}`);
});
// console.log(`/${uuidv4()}`);

app.get("/:room", (req, res) => {
  res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(()=>{
      socket.to(roomId).emit("user-connected", userId);
    }, 1000)
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);