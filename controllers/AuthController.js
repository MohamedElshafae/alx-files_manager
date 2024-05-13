import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import HttpError from '../utils/HttpError';
import asyncHandler from '../utils/asyncHandler';

const getConnect = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new HttpError(401, 'Unauthorized');
  }

  const base64Credentials = authHeader.match(/Basic (.+)/)[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

  const user = await dbClient.findUserByEmail(email);

  if (!user || sha1(password) !== user.password) {
    throw new HttpError(401, 'Unauthorized');
  }

  const token = uuidv4();

  await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);

  res.json({
    token,
  });
});

const getDisconnect = asyncHandler(async (req, res) => {
  const token = req.headers['x-token'];

  await redisClient.del(`auth_${token}`);

  res.sendStatus(204);
});

export default { getConnect, getDisconnect };
