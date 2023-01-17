// server.js
const port = 3050;
const UPLOAD_PATH = "uploads";
const BASE_URL = "/";
const WS_PATHNAME = "/feed";

const jsonServer = require("json-server");
const auth = require("json-server-auth");
const path = require("path");
const http = require("http");
const parse = require("url").parse;
const {
  getUploadMiddleware,
  getExtendUploadWithFilenameMiddleware,
} = require("./uploadMiddleware");

const {
  getBroadcastNewMessageMiddleware,
  notificationsWS,
} = require("./websocketMiddleware");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.db = router.db;
server.use(middlewares);
server.use(getUploadMiddleware(UPLOAD_PATH));
server.use(auth);
server.use(getExtendUploadWithFilenameMiddleware(UPLOAD_PATH));
server.use(getBroadcastNewMessageMiddleware(port, WS_PATHNAME));
server.use(BASE_URL, router);

const httpServer = http.createServer(server);
httpServer.on("upgrade", function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  console.log("upgrade", pathname);
  if (pathname === WS_PATHNAME) {
    notificationsWS.handleUpgrade(request, socket, head, function done(ws) {
      notificationsWS.emit("connection", ws, request);
    });
  } else {
    console.log("Closing the socket!!");
    socket.destroy();
  }
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`JSON Server is running at port ${port}`);
});
