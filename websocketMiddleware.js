const WebSocketServer = require("ws").WebSocketServer;
const WebSocket = require("ws").WebSocket;

const getBroadcastNewMessageMiddleware = (port, path) => (req, res, next) => {
  // on POST requests we want to monitor the finish event of the 'res' object
  res.on("finish", function () {
    const responseBody = res.req.body;
    // console.log("RES finish", responseBody);
    if (req.method === "POST" && req.originalUrl === "/messages") {
      // We create a websocket client, connect to ourselves,
      // wait for connection completion and then broadcast the new message and close
      const wsClient = new WebSocket(`ws://localhost:${port}${path}`);
      wsClient.on("open", function open() {
        wsClient.send(JSON.stringify(responseBody));
        wsClient.close();
      });
    }
  });
  // Continue to JSON Server router
  next();
};

const notificationsWS = new WebSocketServer({ noServer: true });

notificationsWS.on("connection", function onConnection(ws, connectionRequest) {
  console.log("WebSocket connection established");
  /**
   * Register the on message callback. Executed each time a web app/client, sends data to the ws server.
   */
  ws.on("message", function onMessage(data) {
    try {
      console.log(`Received message from web client with data: ${data}.`);

      notificationsWS.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: false });
        }
      });
    } catch (error) {
      // handle error
      console.error("Error receiving message: " + error);
    }
  });

  /**
   * Register the on close callback. Cleanup before closing the connection.
   */
  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
});

module.exports = {
  getBroadcastNewMessageMiddleware,
  notificationsWS,
};
