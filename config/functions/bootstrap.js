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

module.exports = async () => {
  process.nextTick(async () => {
    let io = require("socket.io")(strapi.server);

    const reservations = await strapi.query("reservation").find({
      status_ne: "checkedout",
    });

    const rooms = await strapi.query("room").find();

    let reservedRooms = flatMap(
      reservations,
      ({ id, checkin, checkout, reserved_room }) => ({
        id,
        checkin,
        checkout,
        reserved_room: reserved_room.map((value) => ({
          id: value.room.id,
          quantity: parseInt(value.reserved_quantity),
        })),
      })
    );

    function reserve(reservationDetails) {
      reservedRooms.push(reservationDetails);
      return reservationDetails;
    }

    function getCurrentReservations(id) {
      return reservedRooms.filter((reservation) => reservation.id === id);
    }

    function removeClientReservation(id) {
      reservedRooms = reservedRooms.filter(
        (reservation) => reservation.id !== id
      );

      console.log(`Reservation ID: ${id} removed`);
    }

    io.on("connection", function (socket) {
      console.log("Client connected");

      socket.on("get-reserved-rooms", async (reservationDetails, callback) => {
        // Reserve if has reservation details
        if (reservationDetails) {
          reserve({ id: socket.id, ...reservationDetails });
          callback();
        }

        socket.emit("get-reserved-rooms", { rooms, reservedRooms });
        console.log("Current reservations", getCurrentReservations(socket.id));
      });

      socket.on("change-room", () => {
        removeClientReservation(socket.id);
      });

      socket.on("disconnect", () => {
        removeClientReservation(socket.id);
      });
    });

    strapi.io = io;
  });
};
