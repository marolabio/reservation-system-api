module.exports = {
  //...
  settings: {
    cors: {
      enabled: true,
      headers: [
        "Content-Type",
        "Authorization",
        "X-Frame-Options",
        "Access-Control-Allow-Headers",
      ],
      expose: [
        "WWW-Authenticate",
        "Server-Authorization",
        "Access-Control-Allow-Headers",
      ],
    },
  },
};
