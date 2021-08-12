import * as express from 'express';
import {getBlockchain} from './blockchain';

const initHttpServer = (port: number) => {
  const app = express();
  app.use(express.json());

  app.get('/blocks', (req, res) => {
    res.send(getBlockchain());
  });

  app.listen(port, () => {
    console.log('Listening http on port: ' + port);
  });
};

initHttpServer(3001);
