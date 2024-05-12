import { MongoClient } from 'mongodb';

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

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const users = this.client.db(
      DATABASE,
    ).collection('users');

    return users.countDocuments();
  }

  async nbFiles() {
    const files = this.client.db(
      DATABASE,
    ).collection('files');

    return files.countDocuments();
  }

  async findUserByEmail(email) {
    const users = this.client.db(
      DATABASE,
    ).collection('users');

    try {
      const user = await users.findOne({ email })

      return user
    } catch(e) { }
  }

  async createUser(email, password) {
    const users = this.client.db(
      DATABASE,
    ).collection('users');

    try {
      const result = await users.insertOne({ email, password })

      return result.insertedId
    } catch(e) { }
  }
}

const dbClient = new DBClient();

export default dbClient;
