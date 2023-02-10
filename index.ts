import express, { Express, Request} from 'express';
import creditCardRouter from './src/creditCard.controller';
import cors from 'cors';

const app: Express = express();
const port = 8001;

app.use(cors<Request>({ origin: 'http://localhost:3000'}));
app.use(express.json());
app.use('/api/v1/creditcard', creditCardRouter);
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// process.on('SIGINT', () => {
//   db.close((err) => {
//     if(err) {
//       return console.error(err);
//     }
//     console.log('Database Closed');
//     // server.close();
//   });
// });
export default app;