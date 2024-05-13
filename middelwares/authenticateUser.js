import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import HttpError from '../utils/HttpError';
import asyncHandler from '../utils/asyncHandler';

const authenticateUser = asyncHandler(async (req, res, next) => {
  const token = req.headers['x-token'];

  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserById(userId);

  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  req.user = user;

  next();
});

export default authenticateUser;
