import express from 'express';
import router from './routes';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(router);

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).json({
    error: message,
  });

  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
