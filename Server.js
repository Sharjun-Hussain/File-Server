const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;


const anotherFIleDirectory = 'F:\Movies'  // Directory Path 

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Use the original filename with an additional timestamp to avoid collisions
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({ storage: storage });
app.use('/Movies', express.static(anotherFIleDirectory));   //  List Out F/Movies Directory
// app.use('/Movies/racher', express.static(anotherFIleDirectory));   //  List Out F/Movies/Racher Directory


app.get('/', async (req, res) => {
  try {
    const files = await fs.readdir(anotherFIleDirectory);

    const fileListHTML = files.map((file) => {
      const filePath = path.join('/Movies', file);
      return `<li><a href="${filePath}" download>${file}</a></li>`;
    }).join('');

    const htmlResponse = `
      <h1>Downloadable Files</h1>
      <ul>${fileListHTML}</ul>
      <br/>
      <h1>Upload Files</h1>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <input type="submit" value="Upload">
      </form>
    `;

    res.send(htmlResponse);
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/upload', upload.single('file'), (req, res) => {
  // The uploaded file can be accessed through req.file
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const uploadedFilePath = path.join(__dirname, 'uploads', req.file.filename);
  res.send(`File uploaded to: ${uploadedFilePath}`);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});