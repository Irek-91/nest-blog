import { stopPostgresContainer } from "./docker-db";

module.exports = async () => {
  await stopPostgresContainer(global.__TESTCONTAINER__);
};