const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs')
// Serve the index.html file
app.get('/',(req,res)=>{
    const data = {
        title: 'My Page',
        message: 'BCT AB 4th year 2nd part',
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          
        },
        data:['katra','hai','mat','jao'],
        summer_time:['10:15','11:00','11:45','12:30','1:00','1:45','2:30','3:15','4:00'],
        winter_time:['10:15','11:05','11:55','12:40','1:15','2:00','2:45','3:30','4:15']
      };

      res.render('index', data);


})
app.get('/convert', (req, res) => {
    const data = {
        title: 'My Page',
        message: 'BCT AB 4th year 2nd part',
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        data:['katra','hai','mat','jao'],
        summer_time:['10:15','11:00','11:45','12:30','1:00','1:45','2:30','3:15','4:00'],
        winter_time:['10:15','11:05','11:55','12:40','1:15','2:00','2:45','3:30','4:15']
      };

  

  res.render('index', data, (err, html) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }

    // Convert the HTML to a PDF using Puppeteer
    convertHtmlToPdf(html).then((pdfBuffer) => {
      // Send the PDF as a response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
      res.send(pdfBuffer);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  });
});


async function convertHtmlToPdf(html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Set the HTML content of the page
    await page.setContent(html);
  
    // Convert the page to a PDF
    const pdfBuffer = await page.pdf({ format:'Ledger',printBackground: true });
  
    await browser.close();
  
    return pdfBuffer;
  }

// Convert the index.html file to a PDF



app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});