const express = require("express");
const multer = require("multer");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const upload = multer({ storage: storage }).single("file");

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.static("public/uploads"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/htmltopdf', upload, async (req, res) => {
    try {
        const html = fs.readFileSync(req.file.path, 'utf8');
        const pdfFilePath = `./public/pdfs/${req.file.originalname.replace('.html', '.pdf')}`;

        pdf.create(html, { format: 'Letter' }).toFile(pdfFilePath, (err, result) => {
            if (err) {
                throw new Error(err);
            }

            res.download(pdfFilePath, (err) => {
                if (err) {
                    throw new Error(err);
                }

                fs.unlinkSync(req.file.path);
                fs.unlinkSync(pdfFilePath);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred');
    }
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});