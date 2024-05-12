import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({
      error: 'Missing email',
    });

    return;
  }

  if (!password) {
    res.status(400).json({
      error: 'Missing password',
    });

    return;
  }

  const user = await dbClient.findUserByEmail(email);

  if (user) {
    res.status(400).json({
      error: 'Already exist',
    });

    return;
  }

  const passwordHash = sha1(password);

  const id = await dbClient.createUser(email, passwordHash);

  res.status(201).json({
    id,
    email,
  });
};

const getMe = async (req, res) => {
  const token = req.headers['x-token'];

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const email = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserByEmail(email);

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  res.json({
    id: user._id,
    email: user.email,
  });
};

export default { postNew, getMe };
