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
    req.session.username = user.username;
    req.session.user_type = user.user_type;
    res.redirect('/dashboard');
  }
});

app.get('/dashboard', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

  // Load user data from JSON file
  const users = JSON.parse(fs.readFileSync('./Data/users.json'));
  const patients = JSON.parse(fs.readFileSync('./Data/patients.json'));

  // Find user by ID
  const user = users.find(u => u.id === req.session.userId);

  // Serve the dashboard HTML page and replace [username] with the actual username
  res.render('dashboard', {patients:patients});

  // const dashboardPage = fs.readFileSync(__dirname + '/public/dashboard.html', 'utf8');
  // const renderedPage = dashboardPage.replace('[username]', user.username);
  // res.send(renderedPage);
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
    res.send("Hooray")
    
  }

});


// Patient routes

//get a specific patient

app.get('/getPatient/:id',(req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

  id=req.session.userId
  userName=req.session.username
  userType=req.session.user_type

  console.log(id,userName,userType)
  userType=req.session.user_type
  if (userType=='doctor') {
    const doctor=new Doctor(id,userName,userType)
    const patient= doctor.fetchPatient( req.params.id)
    res.render('patient',{patient:patient});
  }else if (userType=='receptionist') {
    const receptionist=new Receiptionist(id,userName,userType)
    const patient=receptionist.fetchPatient(parseInt(req.params.id))
    console.log(patient)
    res.render('patient',{patient:patient});
  }

});

// add/update a patient
app.get('/addPatient', (req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  res.render('PatientAdd');
  });

app.post('/addPatient', (req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

  const { name, age, contact, gender,address } = req.body;
  let patients = [];
  patients = JSON.parse(fs.readFileSync('./Data/patients.json'));

  const patient={
    id: patients.length +1,
    name:name,
    age:age,
    gender:gender,
    contact:contact,
    address:address
  }


  if (req.session.user_type==='doctor') {
    const doctor= new Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.setPatient(patient)
    res.send(response);
  }else if (req.session.user_type==='receptionist') {
    const receptionist= new Receiptionist(req.session.userId,req.session.username,req.session.user_type)
    const response=receptionist.setPatient(patient)
    res.send(response);
  }

});

//delete a patient 
app.get('/deletePatient/:id', (req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  if (req.session.user_type=='doctor') {
    const doctor= new Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.deletePatient(parseInt(req.params.id))
    res.send(response);
  }else if (req.session.user_type=='receptionist') {
    const receptionist=new Receiptionist(req.session.userId,req.session.username,req.session.user_type)
    const response=receptionist.deletePatient(parseInt(req.params.id))
    res.send(response);
  }
});


// Records routes

//get a specific record

app.get('/getRecord/:id',(req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  
  if (req.session.user_type==='doctor') {
    const doctor=new Doctor(req.session.userId,req.session.username,req.session.user_type)
    const record=doctor.fetchRecords(parseInt(req.params.id))
    res.render('record',{response:record});
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
    const doctor=new Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.setRecords(record)
    res.send(response);
  }else if (req.session.user_type==='receptionist') {
    return res.status(400).json({ error: "You are not allowed to access Records" });
  }

});

//delete a record 
app.get('/deleteRecord/:id', (req,res)=>{
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  if (req.session.user_type=='doctor') {
    const doctor=Doctor(req.session.userId,req.session.username,req.session.user_type)
    const response=doctor.deleteRecord(parseInt(req.params.id))
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

