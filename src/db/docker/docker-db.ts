import * as Docker from 'dockerode';

const docker = new Docker();

export const startPostgresContainer = async () => {
    //скачиваем докер контейнер если его еще нет
    await new Promise((resolve) => {
        docker.pull('postgres:latest', (err, stream) => {
            docker.modem.followProgress ( stream , onFinished )
            function onFinished ( err ,  output )  {
               resolve(output)
            }
        })
    })
    //Создаем контейнер
    const container = await docker.createContainer({
        Image: 'postgres:latest',
        Env: [
            'POSTGRES_USER=sandbox',
            'POSTGRES_PASSWORD=sandbox',
            'POSTGRES_DB=sandbox'
        ],
        HostConfig: {
            PortBindings: {
                '5432/tcp': [
                    {
                        HostPort: '5445'
                    }
                ]
            }
        },
        healthcheck: {
            test: ['CMD-SHELL', 'pg_isready -U sandbox'],
            interval: 1000000000,  // in nanoseconds
            timeout: 3000000000,   // in nanoseconds
            retries: 3
        }
    });
    //Запускаем наш контейнер
    await container.start();
    //Ждем 10 секунд чтобы контейнер успешно запустил все сервисы включая PostgreSQL
    await new Promise(resolve => setTimeout(resolve, 10000));
    return container;
};

export const stopPostgresContainer = async (container) => {
    // Останавливаем контейнер
    await container.stop();
    // Удаляем контейнер
    await container.remove();
};