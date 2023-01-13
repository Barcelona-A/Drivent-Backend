import { createClient } from "redis";

let redisClient: any;

async function runRedis() {
  redisClient = createClient();
  await redisClient.connect();
}
runRedis();

function set(key: string, value: string) {
  return redisClient.set(key, value);
}
  
function get(key: string) {
  return redisClient.get(key);
}

function exists(key: string) {
  return redisClient.exists(key);
}

const redis = {
  set,
  get,
  exists
};

export default redis;
  
