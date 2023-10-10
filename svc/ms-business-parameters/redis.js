const redis = require('redis');

// Create a Redis client
let redisClient;

const redisClientConnection = async () => {
    redisClient = redis.createClient({
        host: 'localhost', // Redis server hostname
        port: 6379,        // Redis server port
        password: 'dtwinv!@#'
    });

    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
}

redisClientConnection();
// Export the connect function
module.exports = redisClient;