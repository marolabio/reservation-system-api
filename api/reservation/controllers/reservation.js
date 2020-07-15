"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async create(ctx) {
    const { firstName, lastName, email, rooms } = ctx.request.body;
    const checkUnavailableRoom = await strapi
      .query("room")
      .count({ available_lte: 0, id_in: rooms.map((room) => room.id) });

    // Validations
    if (rooms.length < 0) throw new Error("Rooms are required.");
    if (checkUnavailableRoom !== 0) throw new Error("Unable to reserve.");

    // Update room quantity
    await Promise.all(
      rooms.map(async (room) => {
        const currentRoom = await strapi.services.room.findOne({ id: room.id });
        currentRoom.available = currentRoom.available - room.quantity; 

        return await strapi.services.room.update({ id: room.id }, currentRoom);
      })
    );

    // Create customer
    const createdCustomer = await strapi.services.customer.create({
      first_name: firstName,
      last_name: lastName,
      email,
    });

    // Create reservation
    let entity = await strapi.services.reservation.create({
      customer: createdCustomer.id,
      reserved_room: rooms.map((room) => ({
        room: room.id,
        reserved_quantity: room.quantity,
      })),
    });

    return sanitizeEntity(entity, { model: strapi.models.reservation });
  },
};
