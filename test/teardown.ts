import { stopPostgresContainer } from './../src/db/docker/docker-db';

module.exports = async () => {
  await stopPostgresContainer(global.__TESTCONTAINER__);
};
