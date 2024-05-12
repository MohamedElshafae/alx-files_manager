import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const getConnect = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  const base64Credentials = authHeader.match(/Basic (.+)/)[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

  const user = await dbClient.findUserByEmail(email);

  if (!user || sha1(password) !== user.password) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  const token = uuidv4();

  await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);

  res.json({
    token,
  });
};

const getDisconnect = async (req, res) => {
  const token = req.headers['x-token'];
  const id = await redisClient.get(`auth_${token}`);

  const user = await dbClient.findUserById(id);

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  await redisClient.del(`auth_${token}`);

  res.sendStatus(204);
};

export default { getConnect, getDisconnect };
