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
          return res.send('Invalid email id or password');
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
          return res.send('No user exists');
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
          return res.send('There was no change in the data');
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
        if(rows.affectedRows > 0) {
          return res.redirect('/');
          //console.log(rows[0].email);
          //return res.render('dash', { title: 'Dashboard', email, name, rollno, place });
        } else {
          return res.send('No user exists');
        }
      } else {
        console.log(err.message);
        return res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.get('/library/:email', (req, res) => {
  try {
    mysqlConnection.query(`SELECT * FROM books WHERE quantity > 0`, (err, rows, fields) => {
      if (!err) {
        return res.render('library', { title: 'Library Dashboard', email: req.params.email, books: rows });
      } else {
        console.log(err.message);
        return res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    return res.render('error', { title: 'Error', err });
  }
});

router.get('/add-book/:email', (req, res) => {
  res.render('add-book', { title: 'Add Book', email: req.params.email });
});

router.post('/add-book', (req, res) => {
  const { bookName, author, price, quantity } = req.body;
  try {
    mysqlConnection.query(`INSERT INTO books(bookName, author, price, quantity) VALUES("${bookName}", "${author}", "${price}", "${quantity}")`, (err, rows, fields) => {
      if (!err) {
        return res.redirect(`/library/${req.body.email}`);
      } else {
        console.log(err.message);
        console.log(err.status);
        return res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.get('/buy-book', (req, res) => {
  //console.log(req.query);
  try {
    mysqlConnection.query(`UPDATE books SET quantity=quantity-${1} WHERE bookId="${req.query.bookId}"`, (err, rows, fields) => {
      if (!err) {
        if(rows.changedRows > 0) {
          mysqlConnection.query(`INSERT INTO sales(bookId, user) VALUES("${req.query.bookId}", "${req.query.email}")`, (err, rows, fields) => {
            if (!err) {
              //console.log(rows);
              return res.redirect(`/library/${req.query.email}`);
            } else {
              console.log(err.message);
              res.render('error', { title: 'Error' , err});
            }
          });
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

router.get('/my-marks/:email', (req, res) => {
  try {
    mysqlConnection.query(`SELECT * FROM marks WHERE user="${req.params.email}"`, (err, rows, fields) => {
      if (!err) {
        console.log(rows);
        res.render('my-marks', { title: 'Marks', email: req.params.email, marks: rows });
      } else {
        console.log(err.message);
        return res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.get('/add-mark/:email', (req, res) => {
  res.render('add-mark', { title: 'Add Mark', email: req.params.email});
});

router.post('/add-mark', (req, res) => {
  const { email,subject, mark, total } = req.body;
  try {
    mysqlConnection.query(`INSERT INTO marks(user, subject, marks, total) VALUES("${email}", "${subject}", "${mark}", "${total}")`, (err, rows, fields) => {
      if (!err) {
        //console.log(rows);
        return res.redirect(`/my-marks/${req.body.email}`);
      } else {
        console.log(err.message);
        return res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.get('/parent/:email', (req, res) => {
  try {
    mysqlConnection.query(`SELECT * FROM parents WHERE student="${req.params.email}"`, (err, rows, fields) => {
      if (!err) {
        //console.log(rows);
        return res.render('parent', { title: 'Parent', email: req.params.email, parent: rows[0] });
      } else {
        console.log(err.message);
        return res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

router.get('/add-parent/:email', (req, res) => {
  res.render('add-parent', { title: 'Add Parent', email: req.params.email});
});

router.post('/add-parent', (req, res) => {
  const { email, name, age, job, relation } = req.body;
  try {
    mysqlConnection.query(`INSERT INTO parents(student, name, age, job, relation) VALUES("${email}", "${name}", "${age}", "${job}", "${relation}")`, (err, rows, fields) => {
      if (!err) {
        //console.log(rows);
        return res.redirect(`/parent/${req.body.email}`);
      } else {
        console.log(err.message);
        return res.render('error', { title: 'Error' , err});
      }
    });
  } catch (err) {
    console.log(err.message);
    res.render('error', { title: 'Error', err });
  }
});

module.exports = router;
