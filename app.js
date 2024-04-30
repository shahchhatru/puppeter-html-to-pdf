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

let names_map={}

 function generateInitials(names) {
  const initials = names.map((name) => {
    // Split each name into words
    const words = name.split(' ');

    // Extract initials from each word
    let nameInitials = words.map((word) => {
      // Extract the first letter of each word
      if (word === 'Ph.D') {
        return ' Dr.';
      }
      return word.charAt(0);
    });

    // Join initials of each word to form initials of the full name
   const end=nameInitials.pop();
   if(end ===" Dr.") {
       nameInitials.push(end)
       nameInitials=nameInitials.reverse()
   }
   let value=nameInitials.join('');
   names_map[value]=name;
   return value
  });
    
  
  return initials.join(' ')
}



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
  for (const item of responseData) {
    const { day } = item;
    if (!rearrangedData[day]) {
      console.error(`Day '${day}' not found in daysOfWeek array.`);
    } else {
      // Await the Axios request to ensure it completes before calling generateInitials
      
      rearrangedData[day].push({...item});
    }
  }

  return rearrangedData;
}


function generateInitials(names){
  const initial=names.map(name=>{
    //split each name into words;
    const words =name.split(" ");
    for( item of words){
      console.log()
    }

  })
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

app.get('/convert', async (req, res) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/routines/get_alternate_routines_by_year_part_year_id_course_id_and_section/?year_id=${year}&year_part=${year_part}&course_id=${course_id}&section=${section}&alternate=${'False'}`
    );

    const responseAlt = await axios.get(
      `http://127.0.0.1:8000/api/routines/get_alternate_routines_by_year_part_year_id_course_id_and_section/?year_id=${year}&year_part=${year_part}&course_id=${course_id}&section=${section}&alternate=${'True'}`
    );

    const course_response = await axios.get(`http://127.0.0.1:8000/api/courses/${course_id}/`);

    // Rearrange the response data
    const rearrangedData = rearrangeResponseData(response.data);
    const rearrangedDataAlt = rearrangeResponseData(responseAlt.data);

    const data = {
      title: 'My Page',
      message: 'BCT AB 4th year 2nd part',
      user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      routines: rearrangedData,
      altroutine: rearrangedDataAlt,
      coursedata: course_response.data,
      winter_time: ['10:15', '11:00', '11:45', '12:30', '1:00', '1:45', '2:30', '3:15', '4:00'],
      summer_time: ['10:15', '11:05', '11:55', '12:45', '1:35', '2:25', '3:15', '4:05', '4:55']
    };

    // Render the HTML page
    res.render('index', data, async (err, html) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      try {
        // Convert the HTML to a PDF using Puppeteer
        const pdfBuffer = await convertHtmlToPdf(html);

        // Set headers to trigger file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
        
        // Send the PDF as a response
        res.send(pdfBuffer);
      } catch (err) {
        console.error(err);
        res.sendStatus(500);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
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