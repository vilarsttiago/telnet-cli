const Telnet = require('./src/index.js');

const connection = new Telnet();

async function run() {
  let opts = {
    host: '177.87.6.82',
    port: 888,
    timeout: 500, 
    waitPrompt: 'Login:',
    ors: '\r\n',
    username: 'admin',
    password: 'ad182012',
    sendTimeout: 2000,
  }
  
  const teste = await connection.connect(opts)
    .catch(error => {
      console.log(typeof(error))
      console.log(error)
    }
  );

  // console.log(teste)

  console.log(await connection.send('admin'));
  console.log(await connection.send('ad182012'));
  console.log(await connection.send('enable'));
  console.log(await connection.send('ad182012'));
//   await connection.send(opts.password, {waitfor: "OLT-JUREMA>"});
//   await connection.send('enable', {waitfor: "Password:"});
//   await connection.send(opts.password, {waitfor: 'OLT-JUREMA#'});
//   await connection.send('configure terminal', {waitfor: 'OLT-JUREMA(config)#'});
//   const result = await connection.send('show startup-config', async () => {
//     await connection.destroy();
//   });
//   console.log(result);
}

run();