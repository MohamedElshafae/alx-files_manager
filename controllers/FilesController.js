import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import HttpError from '../utils/HttpError';
import asyncHandler from '../utils/asyncHandler';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const postUpload = asyncHandler(async (req, res) => {
  const { user } = req;

  const {
    name,
    type,
    parentId,
    isPublic,
    data,
  } = req.body;

  if (!name) {
    throw new HttpError(400, 'Missing name');
  }

  if (!type) {
    throw new HttpError(400, 'Missing type');
  }

  if (!data && type !== 'folder') {
    throw new HttpError(400, 'Missing data');
  }

  if (parentId) {
    const parent = await dbClient.findFileById(parentId);

    if (!parent) {
      throw new HttpError(400, 'Parent not found');
    }

    if (parent.type !== 'folder') {
      throw new HttpError(400, 'Parent is not a folder');
    }
  }

  if (type === 'folder') {
    const folder = await dbClient.createFile(
      user.id,
      name,
      type,
      undefined,
      isPublic,
      parentId,
    );

    res.status(201).json(folder);

    return;
  }

  if (!fs.existsSync(FOLDER_PATH)) {
    fs.mkdirSync(FOLDER_PATH);
  }

  const localPath = `${FOLDER_PATH}/${uuidv4()}`;
  const decodedData = Buffer.from(data, 'base64').toString('ascii');

  fs.writeFileSync(localPath, decodedData);

  const file = await dbClient.createFile(
    user.id,
    name,
    type,
    localPath,
    isPublic,
    parentId,
  );

  res.status(201).json({ ...file, localPath: undefined });
});

const getShow = asyncHandler(async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const file = await dbClient.findUserFileById(
    user.id,
    id,
  );

  if (!file) {
    throw new HttpError(404, 'Not found');
  }

  res.json({ ...file, localPath: undefined });
});

const getIndex = asyncHandler(async (req, res) => {
  const { user } = req;
  const { page } = req.query;
  let { parentId } = req.query;

  parentId = parentId === '0' ? 0 : parentId;

  const files = await dbClient.findUserFilesByParentId(
    user.id,
    parentId,
    page,
  );

  res.json(files.map((file) => (
    { ...file, localPath: undefined }
  )));
});

export default { postUpload, getShow, getIndex };
