"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

module.exports = async () => {
  let io = await require("socket.io")(strapi.server);

  io.on("connection", function (socket) {
    console.log("Client connected");

    io.sockets.emit("hello", "hello socket");
    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  strapi.io = io;
};