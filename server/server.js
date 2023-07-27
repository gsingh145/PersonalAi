const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = 5000; 
app.use(express.json());

let output = "";

function pythonScript(message) {
  return new Promise((resolve, reject) => {
    let words = '';
    const pythonProcess = spawn('python', ['ai.py', message]);

    pythonProcess.stdout.on('data', (data) => {
      words += data.toString();
      console.log(words);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(words);
      } else {
        console.error('Python script execution failed with code:', code);
        reject(new Error('Python script execution failed'));
      }
    });
  });
}

app.post('/send', async (req, res) => {
  const { message } = req.body;
  if (message) {
    try {
      console.log('Received message:', message);
      output = await pythonScript(message);
      console.log('Python script output:', output);
      res.status(200).json({ output });
    } catch (error) {
      console.error('Error executing Python script:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(400).json({ error: 'Message is required' });
  }
});

app.get('/send', (req, res) => {
  res.json(output);
  output = '';
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
