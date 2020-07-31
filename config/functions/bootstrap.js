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

    function getCurrentReservation(id) {
      return reservedRooms.find((reservation) => reservation.id === id);
    }

    function removeClientReservation(id) {
      reservedRooms = reservedRooms.filter(
        (reservation) => reservation.id !== id
      );
      return id;
    }

    io.on("connection", function (socket) {
      console.log("Client connected");

      socket.on("get-reserved-rooms", async (reservationDetails) => {
        // Reserve if has reservation details
        reservationDetails && reserve({ id: socket.id, ...reservationDetails });

        socket.emit("get-reserved-rooms", { rooms, reservedRooms });
        console.log(getCurrentReservation(socket.id));
      });

      socket.on("disconnect", () => {
        const removedReservationId = removeClientReservation(socket.id);

        if (removedReservationId) {
          console.log(`Reservation ID: ${removedReservationId} removed`);
        }
      });
    });

    strapi.io = io;
  });
};
