"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const flatMap = require("array.prototype.flatmap");

module.exports = {
  updateSocket: async (reservationDetails) => {
    const reservations = await strapi.query("reservation").find({
      status_ne: "checkedout",
    });
    const rooms = await strapi.query("room").find();

    let reservedRooms = flatMap(
      reservations,
      ({ checkin, checkout, reserved_room }) => ({
        checkin,
        checkout,
        reserved_room: reserved_room.map((value) => ({
          id: value.room.id,
          quantity: value.reserved_quantity,
        })),
      })
    );

    if (reservationDetails) {
      console.log("Client reservation details", reservationDetails);
      reservedRooms.push(reservationDetails);
    }

    return strapi.io.emit("get-reserved-rooms", { rooms, reservedRooms });
  },
};
