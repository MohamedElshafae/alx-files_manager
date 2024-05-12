import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const getStatus = (req, res) => {
  res.json({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
};

const getStats = async (req, res) => {
  const nbUsers = await dbClient.nbUsers();
  const nbFiles = await dbClient.nbFiles();

  res.json({
    users: nbUsers,
    files: nbFiles,
  });
};

export default { getStatus, getStats };
