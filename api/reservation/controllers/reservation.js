"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async create(ctx) {
    const {
      firstName,
      lastName,
      email,
      rooms,
      checkin,
      checkout,
      status,
      adult, 
      children
    } = ctx.request.body;

    // Validations
    if (rooms.length < 0) throw new Error("Rooms are required.");

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
      checkin,
      checkout,
      status,
      adult, 
      children
    });

    // Socket io
    await strapi.services.reservation.updateSocket();

    return sanitizeEntity(entity, { model: strapi.models.reservation });
  },
};
