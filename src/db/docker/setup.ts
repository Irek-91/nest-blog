import { startPostgresContainer } from "./docker-db";

module.exports = async () => {
    global.__TESTCONTAINER__ = await startPostgresContainer();
};