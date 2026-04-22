const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // First, remove the manual traefik to not conflict with native Dokploy
  conn.exec('docker rm -f dokploy-traefik && reboot', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
      console.log('VPS Reboot command sent gracefully.');
    }).on('data', (data) => {
      console.log('STDOUT: ' + data.toString());
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data.toString());
    });
  });
}).connect({
  host: '72.60.48.69',
  port: 22,
  username: 'root',
  password: "w;7C,1F'D2d3aavT)Jze"
});
