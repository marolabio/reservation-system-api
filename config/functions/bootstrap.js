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

const flatMap = require("array.prototype.flatmap");

module.exports = () => {
  process.nextTick(async () => {
    let io = require("socket.io")(strapi.server);
    let clientReservations = [];

    function reserve(reservationDetails) {
      clientReservations.push(reservationDetails);
      return reservationDetails;
    }

    function removeClientReservations(id) {
      clientReservations = clientReservations.filter(
        (reservation) => reservation.id !== id
      );

      console.log(`Reservation ID: ${id} removed`);
    }

    io.on("connection", function (socket) {
      console.log("Client connected");

      socket.on("reservations", async (reservationDetails, callback) => {
        const {
          rooms,
          reservedRooms,
        } = await strapi.services.reservation.refetchReservedRoomsData();

        if (reservationDetails) {
          reserve({ id: socket.id, ...reservationDetails });
          callback();
        }

        io.emit("reservations", {
          rooms,
          reservedRooms: [...clientReservations, ...reservedRooms],
        });
        socket.on("remove-client-reservations", () => {
          removeClientReservations(socket.id);

          io.emit("reservations", {
            rooms,
            reservedRooms: [...clientReservations, ...reservedRooms],
          });
        });
      });

      socket.on("disconnect", () => {
        removeClientReservations(socket.id);
      });
    });

    strapi.io = io;
  });
};
