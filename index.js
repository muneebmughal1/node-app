const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000; // You can change this port number if needed

// Sample user data (replace this with your actual data)
const users = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 25 },
  { id: 3, name: 'Bob Johnson', age: 40 },
  { id: 3, name: 'Muneeb Mughal', age: 23 },
  { id: 3, name: 'Muneeb Mughal', age: 25 }
];

// Enable CORS for all routes
app.use(cors());

// API endpoint to return the list of sample users
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/', (req, res) => {
    res.status(200).send('<h1>Hi from Muneeb Mughal</h1>')
  });

app.get('/health', (req, res) => {
    res.statusCode = 200;
    res.send('ok');
}); 
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
