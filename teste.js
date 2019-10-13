const Telnet = require('./src/index.js');

const connection = new Telnet();

async function run() {
  let opts = {
    host: '177.87.6.93',
    port: 444,
    timeout: 500, 
    waitPrompt: 'username:',
    ors: '\r',
    username: 'root',
    password: 'ad182012',
    sendTimeout: 2000,
  }
  
  const teste = await connection.connect(opts)
    .catch(error => {
      console.log(typeof(error))
      console.log(error)
    }
  );

  console.log(teste)

  await connection.send(opts.username, {waitfor: "password:"});
  await connection.send(opts.password, {waitfor: "OLT>"});
  await connection.send('enable', {waitfor: "OLT#"});
  await connection.send('configure', {waitfor: /OLT\(config\)#/});
  await connection.send('interface onu 2/1', {waitfor: /OLT\(config-onu-\d\/\d\)#/});
  const result = await connection.send('show optical-diagnose', {waitfor: "receive power"}, async () => {
    await connection.destroy();
  });
  console.log(result);
}

run();