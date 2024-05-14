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

  const newUser = await dbClient.createUser(email, sha1(password));

  res.status(201).json(newUser);
});

const getMe = asyncHandler(async (req, res) => {
  const { id, email } = req.user;

  res.json({
    id,
    email,
  });
});

export default { postNew, getMe };
