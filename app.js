const express = require('express');
const session = require('express-session');
const fs = require('fs');
var hbs = require('hbs');
const { Doctor,Receiptionist }= require('./user.js');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

app.set('views', 'views');
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Load user data from JSON file
  const users = JSON.parse(fs.readFileSync('./Data/users.json'));

  // Check if user exists and password is correct
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    res.send('Invalid username or password');
  } else {
    // Store user ID in session
    req.session.userId = user.id;
    req.session.user_type=user.user_type;

    res.redirect('/dashboard');


  }
});

app.get('/dashboard', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

   // Check if user is a doctor or a receptionist
   if (req.session.user_type === 'doctor') {
    res.redirect('/appointments');
    } 

  // Load user data from JSON file
  const users = JSON.parse(fs.readFileSync('./Data/users.json'));
  // Load patient data from JSON file
  const patients = JSON.parse(fs.readFileSync('./Data/patients.json'));

  // Load patients whose status is pending
  const pendingPatients = patients.filter(patient => patient.status === 'pending');


  // Find user by ID
  const user = users.find(u => u.id === req.session.userId);

  // Print username in console
  console.log(`User ${user.username} is logged in`);

  // Serve the dashboard HTML page and replace [username] with the actual username
  res.render('dashboard', {username: user.username,patients:pendingPatients});

  // const dashboardPage = fs.readFileSync(__dirname + '/public/dashboard.html', 'utf8');
  // const renderedPage = dashboardPage.replace('[username]', user.username);
  // res.send(renderedPage);
});

app.get('/appointments', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {

    res.redirect('/login');
    return;
  }

  // Check if user is a doctor or a receptionist
  if (req.session.user_type === 'receptionist') {
    res.redirect('/dashboard');
    }




  // Load user data from JSON file
  const users = JSON.parse(fs.readFileSync('./Data/users.json'));

   // Load patient data from JSON file
   const patients = JSON.parse(fs.readFileSync('./Data/patients.json'));

   // Load patients whose status is pending
    const pendingPatients = patients.filter(patient => patient.status === 'pending');


  // Find user by ID
  const user = users.find(u => u.id === req.session.userId);

  // Serve the appointments HTML page and replace [username] with the actual username
  res.render('appointments', {username: user.username,patients:pendingPatients});  
});



app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});


// Register endpoint
app.post('/register', (req, res) => {
  const { username, password, user_type } = req.body;

  let users = [];
  if (fs.existsSync('./Data/users.json')) {
    users = JSON.parse(fs.readFileSync('./Data/users.json', 'utf8'));
  }

  // Check if username is already taken
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ error: 'Username is taken!' });
  }else{


    const user = {
      id: users.length + 1,
      username: username,
      password: password,
      user_type: user_type
    };


    users.push(user);
    fs.writeFileSync('./Data/users.json', JSON.stringify(users));
    res.send("Registered")
    
  }

});


// Patient routes

//get all patients

app.get('/getPatients', function (req, res) {
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

    fs.readFile('./Data/patients.json', (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving patient data');
    } else {
      const patients = JSON.parse(data);
      res.render('dashboard', { patients });
    }
  });
  
});


// get all records

app.get('/history', function (req, res) {
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

  // Check if user is receptionist
  if (req.session.user_type === 'receptionist') {
    res.redirect('/appointments');
    return;
  }

    fs.readFile('./Data/records.json', (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving patient data');
    } else {
      const records = JSON.parse(data);
      res.render('history', { records });
    }
  });

});








//get a specific patient

app.get('/getPatient',(req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  
  if (req.session.user_type==='doctor') {
    const doctor=Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.fetchPatient(req.body.id)
    res.send(response);
  }else if (req.session.user_type==='receptionist') {
    const receptionist=Receiptionist(req.session.userId,req.session.username,req.session.user_type)
    const response=receptionist.fetchPatient(req.body.id)
    res.send(response);
  }

});

// add/update a patient

app.post('/addPatient', function (req, res) {
  const name = req.body.name;
  const age = req.body.age;
  const gender = req.body.gender;
  const contact = req.body.contact;
  const address = req.body.address;

  const newPatient = {
    name: name,
    age: age,
    gender: gender,
    contact: contact,
    address: address,
    status:"pending"
  };

  fs.readFile('./Data/patients.json', function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Error: Could not read patients.json file');
      return;
    }

    const patients = JSON.parse(data);
    patients.push(newPatient);


    

    fs.writeFile('./Data/patients.json', JSON.stringify(patients), function (err) {
      if (err) {
        console.log(err);
        res.status(500).send('Error: Could not write to patients.json file');
        return;
      }

      res.redirect('/');
    });

  });
});

//add a record to record.json file

app.post('/addRecord', function (req, res) {
  const name = req.body.name;
  const contact = req.body.contact;
  const condition = req.body.condition;
  const description = req.body.description;
  const prescription = req.body.prescription;


  const newRecord = {
    name: name,
    contact: contact,
    condition: condition,
    description: description,
    prescription: prescription,
  };

  fs.readFile('./Data/records.json', function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Error: Could not read records.json file');
      return;
    }


    const records = JSON.parse(data);
    records.push(newRecord);

    // change patient status to "seen" after adding a record
    fs.readFile('./Data/patients.json', function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send('Error: Could not read patients.json file');
        return;
      }

      const patients = JSON.parse(data);
      for (let i = 0; i < patients.length; i++) {
        if (patients[i].contact === contact) {
          patients[i].status = "seen";
        }
      }

      fs.writeFile('./Data/patients.json', JSON.stringify(patients), function (err) {
        if (err) {
          console.log(err);
          res.status(500).send('Error: Could not write to patients.json file');
          return;
        }
      });


    fs.writeFile('./Data/records.json', JSON.stringify(records), function (err) {
      if (err) {
        console.log(err);
        res.status(500).send('Error: Could not write to records.json file');
        return;
      }

      res.redirect('/');
    }
    );


    
  });
});

});




//delete a patient 
app.delete('/deletePatient', (req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  if (req.session.user_type==='doctor') {
    const doctor=Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.deletePatient(req.body.id)
    res.send(response);
  }else if (req.session.user_type==='receptionist') {
    const receptionist=Receiptionist(req.session.userId,req.session.username,req.session.user_type)
    const response=receptionist.deletePatient(req.body.id)
    res.send(response);
  }
});


// Records routes

//get a specific record

app.get('/getRecord',(req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

  if (req.session.user_type==='receptionist') {
    res.redirect('/login');
    return;
  }
  
  if (req.session.user_type==='doctor') {
    const doctor=Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.fetchRecords(req.body.id)
    res.send(response);
  }else if (req.session.user_type==='receptionist') {
    return res.status(400).json({ error: "You are not allowed to access Records" });
  }

});

// add/update a record

app.post('/addrecord', (req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

  const { patientid, condition, description, gender,prescription } = req.body;
  let records = [];
  records = JSON.parse(fs.readFileSync('./Data/records.json'));

  const record={
    id: records.length +1,
    patientid:patientid,
    condition:condition,
    description:description,
    prescription:prescription
  }


  if (req.session.user_type==='doctor') {
    const doctor=Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.setRecords(record)
    res.send(response);
  }else if (req.session.user_type==='receptionist') {
    return res.status(400).json({ error: "You are not allowed to access Records" });
  }

});

//delete a record 
app.delete('/deleteRecord', (req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  if (req.session.user_type==='doctor') {
    const doctor=Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.deleteRecord(req.body.id)
    res.send(response);
  }else if (req.session.user_type==='receptionist') {
    return res.status(400).json({ error: "You are not allowed to access Records" });
  }
});


app.get('/logout', (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy();
  res.redirect('/login');
  
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

