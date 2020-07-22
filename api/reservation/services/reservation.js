"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const flatMap = require("array.prototype.flatmap");

module.exports = {
  updateSocket: async () => {
    const reservations = await strapi.query("reservation").find({
      status_ne: "checkedout",
    });
    const rooms = await strapi.query("room").find();

    const reservedRooms = flatMap(
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

    return strapi.io.emit("get-reserved-rooms", { rooms, reservedRooms });
  },
};
