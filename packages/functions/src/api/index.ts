import * as express from 'express';

const app = express();

app.get('/hello', (req, res) => {
  res.send('Hello from Firebase!');
});


export default app;
