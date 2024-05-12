import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor () {
    this.client = new MongoClient(
      `mongodb://${HOST}:${PORT}`
    );

    this.client.connect();
  }

  isAlive () {
    return this.client.isConnected();
  }

  async nbUsers () {
    const users = this.client.db(
      DATABASE
    ).collection('users');

    return users.countDocuments();
  }

  async nbFiles () {
    const files = this.client.db(
      DATABASE
    ).collection('files');

    return files.countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;
