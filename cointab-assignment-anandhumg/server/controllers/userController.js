const mysql = require('mysql');
var failed=0;
// Connection Pool
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// View Users
exports.view = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      let removedUser = req.query.removed;
      res.render('home', { rows, removedUser });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

// Find User by Search
exports.find = (req, res) => {
  let searchTerm = req.body.search;
  // User the connection
  connection.query('SELECT * FROM user WHERE user_name LIKE ? OR email_id LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
    if (!err) {
      res.render('home', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.form = (req, res) => {
  res.render('add-user');
}

// Add new user
exports.create = (req, res) => {
  const { user_name, email_id, password, confirm_password } = req.body;
  let searchTerm = req.body.search;
  //email checking

  connection.query('SELECT email_id FROM user WHERE email_id =?',[email_id],async (err,result) =>{
    if(err) throw err 
     if(result[0]){
      return res.render('add-user',{
        message: "This email is already in use"
      })
      
    }else if(password !== confirm_password){
      return res.render('add-user',{
        message: "passwords do not match"
      })
    }


  // User the connection
    else{
    connection.query('INSERT INTO user SET user_name = ?, email_id = ?, password = ?, confirm_password = ?', [user_name,  email_id, password, confirm_password], (err, rows) => {
      if (!err) {
        res.render('add-user', { alert: 'User added successfully.' });
      } else {
        console.log(err);
      }
      console.log('The data from user table: \n', rows);
    });



  }
  })







}


// Edit user
exports.edit = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edit-user', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}


// Update User
exports.update = (req, res) => {
  const { user_name, email_id, password, confirm_password } = req.body;
  // User the connection
  connection.query('UPDATE user SET user_name = ?, password = ?, confirm_password = ? WHERE id = ?', [user_name, password, confirm_password, req.params.id], (err, rows) => {

    if (!err) {
      // User the connection
      connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
        // When done with the connection, release it
        
        if (!err) {
          res.render('edit-user', { rows, alert: `${user_name} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from user table: \n', rows);
      });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

// Delete User
exports.delete = (req, res) => {

  // Delete a record

  // User the connection
  //connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows) => {

    //if(!err) {
    //  res.redirect('/');
   //} else {
   //   console.log(err);
   // }
   // console.log('The data from user table: \n', rows);

  //});

  // Hide a record

  connection.query('UPDATE user SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
   if (!err) {
    let removedUser = encodeURIComponent('User successeflly removed.');
      res.redirect('/?removed=' + removedUser);
 
   } else {
     console.log(err);
    }
    console.log('The data from beer table are: \n', rows);
  });

}

// View Users
exports.viewall = (req, res) => {

  // User the connection
  connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('view-user', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}


///login page

exports.login =async (req,res) =>{
  res.render('index');
}


//authentication

exports.auth = async (req, res) =>{
  const {email_id ,password} = req.body;
  if(!email_id || !password){
      return res.render('index',{message:"please fill the form"})
  }
  else{
    
    if(failed<5){
      setTimeout(timer =>{
        failed = 0;
      }, 86400000)

        connection.query('SELECT * FROM user WHERE email_id = ?' , [email_id],async (err, result)=>{
          if(result.length > 0)
          {
            
              for(var count = 0; count < result.length ; count ++)
              {
                  if(result[count].password == password)
                      {
                              res.redirect('home');
                      }
                      else{
                          res.render('index',{messgae: 'Incorrect password'})
                          failed++;
                      }
              }
          }
          else{
              res.render('index' , {message : 'Incorrect email or password'});
              failed++;
          }
      })
  }
  else{
    res.render('index', {failede:"you can only log in after 1 hours"})
    
  }

}
}