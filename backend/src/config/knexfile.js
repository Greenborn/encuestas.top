require('dotenv').config({ path: '../../.env' });

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'petapp',
      charset: 'utf8mb4'
    },
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../database/seeds'
    }
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations'
    }
  }
};
