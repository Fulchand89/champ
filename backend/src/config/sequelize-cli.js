const env = require('./env');

module.exports = {
  development: {
    username: env.db.user,
    password: env.db.password,
    database: env.db.database,
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql'
  },
  test: {
    username: env.db.user,
    password: env.db.password,
    database: env.db.database,
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql'
  },
  production: {
    username: env.db.user,
    password: env.db.password,
    database: env.db.database,
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql'
  }
};
