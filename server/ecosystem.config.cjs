module.exports = {
  apps: [{
    name: "roast-or-recruit",
    script: "server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    },
  }],
};
