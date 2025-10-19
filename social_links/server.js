import express from 'express';
import dotenv from 'dotenv';
import encuestaRouter from './src/routes/encuesta.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/encuesta', encuestaRouter);

app.get('/', (req, res) => {
  res.send('Social Links Backend - Encuestas');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
