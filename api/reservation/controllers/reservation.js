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
      children,
      contactNumber,
    } = ctx.request.body;

    // Validations
    if (rooms.length < 0) throw new Error("Rooms are required.");

    // Create customer
    const createdCustomer = await strapi.services.customer.create({
      first_name: firstName,
      last_name: lastName,
      contact_number: contactNumber,
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
      children,
    });

    const env = strapi.config.get("server.NODE_ENV", "development");

    console.log({ env });
    if (env === "production") {
      await strapi.plugins["email"].services.email.send({
        to: createdCustomer.email,
        from: "marolabio@gmail.com",
        subject: "Online reservation system",
        text: "Reservation success!",
        html: `<h1>Reservation success!</h1>
        <p>Thank you for reserving with us ${createdCustomer.firstName}. Here is your transaction ID: ${entity.id}<p>`,
      });
    }

    return sanitizeEntity(entity, { model: strapi.models.reservation });
  },
};
