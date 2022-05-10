require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "CT",
      script: "./server.js",
      watch: true,
      env: {
        NODE_ENV: process.env.NODE_ENV
      },
      ignore_watch: ["node_modules", "uploads"],
      watch_options: {
        followSymlinks: false
      }
    }
  ]
};
