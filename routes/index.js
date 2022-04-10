var express = require('express');
var router = express.Router();

var mysql = require('mysql');

//MySQL details
var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nabeel@123',
  database: 'nabeel'
});

mysqlConnection.connect((err)=> {
    if(!err)
    console.log('Connection Established Successfully');
    else
    console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Signup' });
});

router.post('/signup', (req, res) => {
  const { email, name, rollno, place, password } = req.body;
  try {
    mysqlConnection.query(`INSERT INTO students values("${email}", "${name}", ${rollno}, "${place}", "${password}")`, (err, rows, fields) => {
      if (!err) {
        //console.log(rows);
        return res.render('dash', { title: 'Dashboard', email, rollno, name, place });
      } else {
        console.log(err.message);
        console.log(err.status);
        res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
 
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    mysqlConnection.query(`SELECT * FROM students WHERE email="${email}"`, (err, rows, fields) => {
      if (!err) {
        if((rows.length> 0) && (rows[0].password === password)) {
          //console.log(rows[0].email);
          return res.render('dash', { title: 'Dashboard', email: rows[0].email, rollno: rows[0].rollno, name: rows[0].name, place: rows[0].place });
        } else {
          res.send('Invalid email id or password');
        }
      } else {
        console.log(err.message);
        res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.get('/edit/:email', (req, res) => {
  try {
    mysqlConnection.query(`SELECT * FROM students WHERE email="${req.params.email}"`, (err, rows, fields) => {
      if (!err) {
        if(rows.length> 0) {
          //console.log(rows[0].email);
          return res.render('edit', { title: 'Update profile', email: rows[0].email, rollno: rows[0].rollno, name: rows[0].name, place: rows[0].place });
        } else {
          res.send('No user exists');
        }
      } else {
        console.log(err.message);
        res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.post('/edit', (req, res) => {
  const { email, name, rollno, place } = req.body;
  try {
    mysqlConnection.query(`UPDATE students SET name="${name}", rollno="${rollno}", place="${place}" WHERE email="${email}"`, (err, rows, fields) => {
      if (!err) {
        console.log(rows);
        if(rows.changedRows > 0) {
          //console.log(rows[0].email);
          return res.render('dash', { title: 'Dashboard', email, name, rollno, place });
        } else {
          res.send('There was no change in the data');
        }
      } else {
        console.log(err.message);
        res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.get('/delete/:email', (req, res) => {
  try {
    mysqlConnection.query(`DELETE FROM students WHERE email="${req.params.email}"`, (err, rows, fields) => {
      if (!err) {
        console.log(rows);
        if(rows.affectedRows > 0) {
          res.redirect('/');
          //console.log(rows[0].email);
          //return res.render('dash', { title: 'Dashboard', email, name, rollno, place });
        } else {
          res.send('No user exists');
        }
      } else {
        console.log(err.message);
        res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

module.exports = router;
