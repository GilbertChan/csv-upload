const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql');
const fs = require('fs');
const papa = require('papaparse');

const app = express();

app.use(fileUpload());

//Connect to mysql
const dbName = 'csvdb';
const csvTableName = 'csvtable';

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'csvuser',
  password: 'sqlpassword123'
});

//Create DB and Table
connection.connect(err => {
  if (err) throw err;
  console.log('DB Connected!');
  connection.query(
    'CREATE DATABASE IF NOT EXISTS ??',
    dbName,
    (err, result) => {
      if (err) throw err;
      console.log('Database created');

      //Connect to the database
      connection.changeUser({ database: dbName }, function(err) {
        if (err) throw err;
      });

      //Create DB table
      let createCSVTable = `CREATE TABLE IF NOT EXISTS ?? (
        date DATE,
        category VARCHAR(255),
        name VARCHAR(255),
        address VARCHAR(255),
        description VARCHAR(255),
        pretax DECIMAL(10,2),
        taxname VARCHAR(255),
        tax DECIMAL(10,2)
      )`;
      connection.query(createCSVTable, [csvTableName], (err, result) => {
        if (err) throw err;
        console.log('Table Created');
      });
    }
  );
});

/* select date_format(s0.date,'%b-%Y') as month,
       (select (sum(s5.pretax)+sum(s5.tax))
        from csvtable s5 
        where month = date_format(s5.date,'%b-%Y')) as total
from csvtable s0
group by month */

//Upload API
app.post('/api/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  //File found, parse then store to database
  const file = req.files.file;
  fs.readFile(file.name, 'utf8', (err, data) => {
    //Save data to SQL DB
    papa.parse(data, {
      complete: results => {
        //Load CSV data into table
        var insertCSV =
          'INSERT INTO ?? (date, category, name, address, description, pretax, taxname, tax) VALUES ?';
        const csvValues = results.data.slice(1);
        const trimCsvValues = csvValues.map(row =>
          row.map((column, index) => {
            if (index == 0) {
              const [month, day, year] = [...column.split('/')];
              return year + '-' + month + '-' + day;
            } else if (index == 5 || index == 7) {
              return parseFloat(column);
            } else {
              return column.trim();
            }
          })
        );
        //console.log(trimCsvValues);
        //Load csv data into the database
        connection.query(insertCSV, [csvTableName, trimCsvValues], function(
          err
        ) {
          if (err) throw err;
        });

        //Get monthly expenses
        var monthlyExpenses =
          "select date_format(s0.date,'%b-%Y') as month, (select (sum(s5.pretax)+sum(s5.tax)) from csvtable s5 where month = date_format(s5.date,'%b-%Y')) as total from csvtable s0 group by month";
        connection.query(monthlyExpenses, function(err, result) {
          if (err) throw err;
          var expensesString = 'Month^Total Expense\n';
          Object.keys(result).forEach(function(key) {
            var row = result[key];
            expensesString += row.month + '^' + row.total + '\n';
          });
          console.log(expensesString.trim());
          res.json({ expenses: expensesString });
        });
      }
    });
  });

  //Save File to server
  /* file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  }); */
});

//Get all expense details from Database
app.get('/api/expenseDetails', function(req, res) {
  //var user_id = req.param('id');
  //Get monthly expenses
  var detailedExpenses =
    "SELECT *,  date_format(date,'%m/%d/%Y') as shortdate FROM ??;";
  connection.query(detailedExpenses, [csvTableName], function(err, result) {
    if (err) throw err;
    var expenseDetailsString =
      'Date^Category^Name^Address^Description^Pretax^Taxname^Tax\n';
    Object.keys(result).forEach(function(key) {
      var row = result[key];
      expenseDetailsString +=
        row.shortdate +
        '^' +
        row.category +
        '^' +
        row.name +
        '^' +
        row.address +
        '^' +
        row.description +
        '^' +
        parseFloat(row.pretax).toFixed(2) +
        '^' +
        row.taxname +
        '^' +
        parseFloat(row.tax).toFixed(2) +
        '\n';
    });
    console.log(expenseDetailsString.trim());
    res.json({ expenseDetails: expenseDetailsString });
  });
});

app.listen(5000, () => console.log('Server Started...'));
