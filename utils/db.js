import { MongoClient, ObjectId } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${HOST}:${PORT}`);

    this.client.connect();
  }

  get usersCollection() {
    return this.client.db(DATABASE).collection('users');
  }

  get filesCollection() {
    return this.client.db(DATABASE).collection('files');
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.usersCollection.countDocuments();
  }

  async nbFiles() {
    return this.filesCollection.countDocuments();
  }

  async findUserByEmail(email) {
    const user = await this.usersCollection.findOne({ email });

    if (!user) {
      return null;
    }

    const { _id, password } = user;

    return {
      id: _id.toString(),
      email,
      password,
    };
  }

  async findUserById(id) {
    const user = await this.usersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!user) {
      return null;
    }

    const { email, password } = user;

    return {
      id,
      email,
      password,
    };
  }

  async createUser(email, password) {
    const result = await this.usersCollection.insertOne({
      email,
      password,
    });

    return {
      id: result.insertedId.toString(),
      email,
    };
  }

  async findFileById(id) {
    const file = await this.filesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!file) {
      return null;
    }

    const {
      userId, name, type, isPublic, parentId, localPath,
    } = file;

    return {
      id,
      userId: userId.toString(),
      name,
      type,
      isPublic,
      parentId: parentId.toString(),
      localPath,
    };
  }

  async createFile(
    userId,
    name,
    type,
    localPath,
    isPublic = false,
    parentId = 0,
  ) {
    const result = await this.filesCollection.insertOne({
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId !== 0 ? new ObjectId(parentId) : 0,
      localPath,
    });

    return {
      id: result.insertedId.toString(),
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    };
  }

  async findUserFilesByParentId(userId, parentId = 0, page = 0, pageSize = 20) {
    const skip = page * pageSize;
    const pipeline = [
      {
        $match: {
          userId: new ObjectId(userId),
          parentId: parentId !== 0 ? new ObjectId(parentId) : 0,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ];

    const files = await this.filesCollection.aggregate(pipeline).toArray();

    return files.map(({
      _id, name, type, isPublic, localPath,
    }) => ({
      id: _id.toString(),
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    }));
  }

  async findUserFileById(userId, id) {
    const file = await this.filesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!file) {
      return null;
    }

    const {
      name, type, isPublic, parentId, localPath,
    } = file;

    return {
      id,
      userId,
      name,
      type,
      isPublic,
      parentId: parentId.toString(),
      localPath,
    };
  }

  async findUserFileByIdAndUpdate(userId, id, update) {
    const result = await this.filesCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      },
      {
        $set: update,
      },
      {
        returnDocument: 'after',
      },
    );

    return result.value;
  }
}

const dbClient = new DBClient();

export default dbClient;
