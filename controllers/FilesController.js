import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const postUpload = async (req, res) => {
  const token = req.headers['x-token'];

  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserById(userId);

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
    });

    return;
  }

  const {
    name,
    type,
    parentId = 0,
    isPublic = false,
    data,
  } = req.body;

  if (!name) {
    res.status(400).json({
      error: 'Missing name',
    });

    return;
  }

  if (!type) {
    res.status(400).json({
      error: 'Missing type',
    });

    return;
  }

  if (!data && type !== 'folder') {
    res.status(400).json({
      error: 'Missing data',
    });

    return;
  }

  if (parentId) {
    const parent = await dbClient.findFileById(parentId);

    if (!parent) {
      res.status(400).json({
        error: 'Parent not found',
      });

      return;
    }

    if (parent.type !== 'folder') {
      res.status(400).json({
        error: 'Parent is not a folder',
      });

      return;
    }
  }

  if (type === 'folder') {
    const folderId = await dbClient.createFile(
      userId,
      name,
      type,
      isPublic,
      parentId,
    );

    res.status(201).json({
      id: folderId,
      userId,
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
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  );

  res.status(201).json({
    id: fileId,
    userId,
    name,
    type,
    isPublic,
    parentId,
  });
};

export default { postUpload };
