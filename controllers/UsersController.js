import sha1 from 'sha1';
import dbClient from '../utils/db';

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

export default { postNew };
