"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */
const flatMap = require("array.prototype.flatmap");

module.exports = {
  refetchReservedRoomsData: async () => {
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

    return { rooms, reservedRooms };
  },
};
