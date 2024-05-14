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
    parentId = 0,
    isPublic = false,
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
    const folderId = await dbClient.createFile(
      user._id,
      name,
      type,
      isPublic,
      parentId,
    );

    res.status(201).json({
      id: folderId,
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    });

    return;
  }

  if (!fs.existsSync(FOLDER_PATH)) {
    fs.mkdirSync(FOLDER_PATH);
  }

  const localPath = `${FOLDER_PATH}/${uuidv4()}`;
  const decodedData = Buffer.from(data, 'base64').toString('ascii');

  fs.writeFileSync(localPath, decodedData);

  const fileId = await dbClient.createFile(
    user._id,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  );

  res.status(201).json({
    id: fileId,
    userId: user._id,
    name,
    type,
    isPublic,
    parentId,
  });
});

const getShow = asyncHandler(async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const file = await dbClient.findUserFileById(
    user._id.toString(),
    id,
  );

  res.json({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  });
});

const getIndex = asyncHandler(async (req, res) => {
  const { user } = req;
  const { parentId, page } = req.query;

  const files = await dbClient.findUserFilesByParentId(
    user._id.toString(),
    parentId,
    page,
  );

  res.json(
    files.map((file) => ({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    })),
  );
});

export default { postUpload, getShow, getIndex };
