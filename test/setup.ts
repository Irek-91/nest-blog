import { startPostgresContainer } from './../src/db/docker/docker-db';

module.exports = async () => {
  global.__TESTCONTAINER__ = await startPostgresContainer();
};
