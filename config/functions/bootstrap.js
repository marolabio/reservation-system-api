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
  process.nextTick(() => {
    let io = require("socket.io")(strapi.server);

    io.on("connection", function (socket) {
      console.log("Client connected");

      socket.on("get-reserved-rooms", async () => {
        await strapi.services.reservation.updateSocket();
      });

      socket.on("disconnect", () => console.log("Client disconnected"));
    });

    strapi.io = io;
  });
};
