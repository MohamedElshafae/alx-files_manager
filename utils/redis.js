import redis from 'redis';
class RedisClient {
  constructor() {
		this.client = redis.createClient();
		this.client.on('error', (err) => {
			console.log(err);
		});
  }
	isAlive() {
		return this.client.connected;
	}
}
const redisClient = new RedisClient();
export default redisClient;