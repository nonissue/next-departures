import express from 'express';
import router from '@/api/depatures';

const app = express();
const PORT = process.env.PORT || 3000;

// Mount your API route
app.use(router);

// Optional: health check
app.get('/', (_, res) => {
    res.send('API is running.');
});

app.listen(PORT, () => {
    console.log(`🚆 Server is running at http://localhost:${PORT}`);
});
