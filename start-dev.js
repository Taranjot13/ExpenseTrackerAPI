const { exec } = require('child_process');

const commands = [
  {
    command: 'npm run dev',
    name: 'BACKEND',
    options: {
      cwd: __dirname,
    },
  },
  {
    command: 'npm start',
    name: 'FRONTEND',
    options: {
      cwd: 'client',
    },
  },
];

console.log('Starting backend and frontend servers...');

commands.forEach(({ command, name, options }) => {
  const process = exec(command, options);

  process.stdout.on('data', (data) => {
    // The frontend server often includes a link to open the app
    if (name === 'FRONTEND' && data.includes('http://localhost')) {
        console.log(`\n\n>>> Frontend is ready! Open your browser to the link below:\n${data}`);
    } else {
        console.log(`[${name}] ${data.trim()}`);
    }
  });

  process.stderr.on('data', (data) => {
    console.error(`[${name}-ERROR] ${data.trim()}`);
  });

  process.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });
});
