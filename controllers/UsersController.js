import sha1 from 'sha1';
import dbClient from '../utils/db';
import HttpError from '../utils/HttpError';
import asyncHandler from '../utils/asyncHandler';

const postNew = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new HttpError(400, 'Missing email');
  }

  if (!password) {
    throw new HttpError(400, 'Missing password');
  }

  const user = await dbClient.findUserByEmail(email);

  if (user) {
    throw new HttpError(400, 'Already exist');
  }

  const passwordHash = sha1(password);

  const id = await dbClient.createUser(email, passwordHash);

  res.status(201).json({
    id,
    email,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const { user } = req;

  res.json({
    id: user._id,
    email: user.email,
  });
});

export default { postNew, getMe };
