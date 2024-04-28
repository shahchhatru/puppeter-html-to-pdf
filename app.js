const express = require('express');
const puppeteer = require('puppeteer');
const axios=require('axios')
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
app.use(bodyParser.json())

const section='AB';
const year=5;
const course_id=1;
const year_part=2;

// Function to rearrange response data into the desired format
// Function to rearrange response data into the desired format
function rearrangeResponseData(responseData) {
  const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri"];
  const rearrangedData = {};

  // Initialize each day with an empty array
  daysOfWeek.forEach(day => {
      rearrangedData[day] = [];
  });

  // Iterate through the response data and populate the rearrangedData object
  responseData.forEach(item => {
      const { day } = item;
      if (!rearrangedData[day]) {
          console.error(`Day '${day}' not found in daysOfWeek array.`);
      } else {
          rearrangedData[day].push(item);
      }
  });

  return rearrangedData;
}



app.set('view engine', 'ejs')
// Serve the index.html file
app.get('/', async (req, res) => {
  try {
      const response = await axios.get(
          `http://127.0.0.1:8000/api/routines/get_alternate_routines_by_year_part_year_id_course_id_and_section/?year_id=${year}&year_part=${year_part}&course_id=${course_id}&section=${section}&alternate=${'False'}`
      );

      const responseAlt = await axios.get(
        `http://127.0.0.1:8000/api/routines/get_alternate_routines_by_year_part_year_id_course_id_and_section/?year_id=${year}&year_part=${year_part}&course_id=${course_id}&section=${section}&alternate=${'True'}`
    );

      const course_response= await axios.get(`http://127.0.0.1:8000/api/courses/${course_id}/`)
     
      // console.log(response.data)
      // Rearrange the response data
      const rearrangedData = rearrangeResponseData(response.data);
      const rearrangedDataAlt=rearrangeResponseData(responseAlt.data);
      console.log(rearrangedData);
      console.log(rearrangedDataAlt);

      const data = {
          title: 'My Page',
          message: 'BCT AB 4th year 2nd part',
          user: {
              name: 'John Doe',
              email: 'john.doe@example.com',
          },
          // Assuming response.data is the data you want to pass to the view
          routines: rearrangedData,
          altroutine:rearrangedDataAlt,
          coursedata:course_response.data,
          winter_time: ['10:15', '11:00', '11:45', '12:30', '1:00', '1:45', '2:30', '3:15', '4:00'],
          summer_time: ['10:15', '11:05', '11:55', '12:45', '1:35', '2:25', '3:15', '4:05', '4:55']
      };
      console.log(response.data[0])
      // Render the HTML page
      res.render('index', data);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
 
    }
});

app.post('/convert', (req, res) => {
  console.log(req.body)
    const data = {
        title: 'My Page',
        message: 'BCT AB 4th year 2nd part',
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        data:['kail','hamar','cena'],
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