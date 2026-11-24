const net = require('net');

const ports = [5000, 5173];

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Stop the existing Clipo development task or choose another port before starting a new one.`));
        return;
      }
      reject(error);
    });

    server.once('listening', () => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    server.listen(port);
  });
}

async function main() {
  for (const port of ports) {
    await checkPort(port);
  }
  console.log('Clipo development ports 5000 and 5173 are available.');
}

main().catch((error) => {
  console.error(`Cannot start Clipo development servers: ${error.message}`);
  process.exitCode = 1;
});
