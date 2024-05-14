import { MongoClient, ObjectId } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(
      `mongodb://${HOST}:${PORT}`,
    );

    this.client.connect();
  }

  get usersCollection() {
    return this.client.db(
      DATABASE,
    ).collection('users');
  }

  get filesCollection() {
    return this.client.db(
      DATABASE,
    ).collection('files');
  }

  isAlive() {
    return this.client.isConnected();
  }

  nbUsers() {
    return this.usersCollection.countDocuments();
  }

  nbFiles() {
    return this.filesCollection.countDocuments();
  }

  findUserByEmail(email) {
    return this.usersCollection.findOne({ email });
  }

  findUserById(id) {
    return this.usersCollection.findOne({
      _id: new ObjectId(id),
    });
  }

  async createUser(email, password) {
    const result = await this.usersCollection.insertOne({
      email,
      password,
    });

    return result.insertedId;
  }

  findFileById(id) {
    return this.filesCollection.findOne({
      _id: new ObjectId(id),
    });
  }

  async createFile(userId, name, type, isPublic, parentId, localPath) {
    const result = await this.filesCollection.insertOne({
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    });

    return result.insertedId;
  }

  findUserFilesByParentId(userId, parentId = 0, page = 0) {
    const pageSize = 20;
    const skip = page * pageSize;

    return this.filesCollection.find({
      userId,
      parentId,
    }).skip(skip).limit(pageSize).toArray();
  }

  findUserFileById(userId, fileId) {
    return this.filesCollection.findOne({
      userId: new ObjectId(userId),
      _id: new ObjectId(fileId),
    });
  }
}

const dbClient = new DBClient();

export default dbClient;
