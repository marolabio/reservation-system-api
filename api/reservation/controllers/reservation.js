"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async create(ctx) {
    const { firstName, lastName, rooms } = ctx.request.body;
    if (rooms.length < 0) throw new Error("Rooms are required.");

    const createdCustomer = await strapi.services.customer.create({
      first_name: firstName,
      last_name: lastName,
    });

    const updatedRooms = await Promise.all(
      rooms.map(async (room) => {
        return await strapi.services.room.update(
          { id: room.id },
          { available: room.quantity }
        );
      })
    );

    let entity = await strapi.services.reservation.create({
      customer: createdCustomer.id,
      room: updatedRooms.map((room) => room.id),
    });

    return sanitizeEntity(entity, { model: strapi.models.reservation });
  },
};
