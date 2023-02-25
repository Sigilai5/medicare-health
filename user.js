
const fs = require('fs');


class User {
    constructor(userId,username) {
      this.username = username;
      this.userId = userId;
    }

    
  }

  class Practitioner extends User{
    constructor(userId,username){
      super(userId,username);
    }

    fetchPatient= (patientId)=>{
      const patients = JSON.parse(fs.readFileSync('./Data/patients.json'));
      const patient = patients.find(u => u.id === patientId);
      return patient
    };

    fetchAllPatients= ()=>{
      let patients = [];
      patients = JSON.parse(fs.readFileSync('./Data/patients.json'));
      return patients
    };

    setPatient= (patient)=>{
      let patients = [];
      patients = JSON.parse(fs.readFileSync('./Data/patients.json', 'utf8'));
      if (patients.find(usr => usr.id === patient.id)) {
        return { error: 'Id is taken!' };
      }else{
        patients.push(patient)
        fs.writeFileSync('./Data/patients.json', JSON.stringify(patients));
        return patients
      }
    };


    updatePatient= (updatedPatient)=>{
      let patients = [];
      patients = JSON.parse(fs.readFileSync('./Data/patients.json'));
      
      if (!patients.find(patient => patient.id === updatedPatient.id)){
        return { error: ' The patient does not exist!!' };
      }else{
        const existingPatient = patients.find(storedRecord => storedRecord.id === updatedPatient.id);
        patients.pop(existingRecord)
        patients.push(updatedRecord)
        fs.writeFileSync('./Data/records.json', JSON.stringify(records));
        return record
      }
    };

    deletePatient= (patientId)=>{
      let patients = [];
      patients = JSON.parse(fs.readFileSync('./Data/patients.json'));
      if (!patients.find(usr => usr.id === patient.id)) {
        return { error: 'Patient does not exist!!' };
      }else{
        const patient = patients.find(u => u.id === patientId);
        patients.pop(patient)
        fs.writeFileSync('./Data/patients.json', JSON.stringify(patients));
        return patients
      }
    };
  }


  class Doctor extends Practitioner {
    constructor(userId,username, user_type) {
      super(userId,username);
      this.user_type = user_type;
    }

    fetchAllRecords= ()=>{
      const records = JSON.parse(fs.readFileSync('./Data/records.json'));
      return records
    };

    setRecords= (newRecord)=>{
      let records = [];
      records = JSON.parse(fs.readFileSync('./Data/records.json'));
      const patients = JSON.parse(fs.readFileSync('./Data/patients.json'));
      if (!patients.find(patient => patient.id === newRecord.patientid)){
            return { error: ' The patient does not exist!!' };
      }
      if (records.find(storedRecord => storedRecord.id === newRecord.id)) {
        return { error: ' Record already exists!!' };
      }else{
        records.push(newRecord)
        fs.writeFileSync('./Data/records.json', JSON.stringify(records));
        return record
      }
    };

    updateRecords= (updatedRecord)=>{
      let records = [];
      records = JSON.parse(fs.readFileSync('./Data/records.json'));
      const patients = JSON.parse(fs.readFileSync('./Data/patients.json'));
      if (!patients.find(patient => patient.id === updatedRecord.patientid)){
        return { error: ' The patient does not exist!!' };
        }
        
      if (!records.find(storedRecord => storedRecord.id === updatedRecord.id)) {
        return { error: ' Record does not exists!!' };
      }else{
        const existingRecord = records.find(storedRecord => storedRecord.id === updatedRecord.id);
        records.pop(existingRecord)
        records.push(updatedRecord)
        fs.writeFileSync('./Data/records.json', JSON.stringify(records));
        return record
      }
    };

    deleteRecords= (recordId)=>{
      let records = [];
      records = JSON.parse(fs.readFileSync('./Data/records.json'));
      if (!records.find(storedRecord => storedRecord.id === recordId)) {
        return { error: 'Record for this patient does not exist!!' };
      }else{
        const record = records.find(storedRecord => storedRecord.id === recordId);
        records.pop(record)
        fs.writeFileSync('./Data/records.json', JSON.stringify(records));
        return {"mesage": "Record deleted!!"}
      }
    };

    fetchRecords= (patientId)=>{
      const records = JSON.parse(fs.readFileSync('./Data/records.json'));
      if (!records.find(storedRecord => storedRecord.patientid === patientId)) {
        return { error: 'Record for this patient does not exist!!' };
      }else{
        const record = records.find(storedRecord => storedRecord.patientid === patientId);
        return record
      }
      
    };

  }

  class Receiptionist extends Practitioner {
    constructor(userId,username, user_type) {
      super(userId,username);
      this.user_type = user_type;
    }
    
  }


  doc= new Doctor(1,"abdi","doctor");
  const patient={"id":2,"name":"Sensei Cop","age":32,"gender":"male","contact":"07503476484","address":"Mombasa"}
  const record = {
    id: 2,
    patientid: 2,
    condition: ' Acidity',
    description: 'Pain in the abdomen',
    prescription: [ 'Nexium, Panadol' ]
  }
  
  console.log(doc.updateRecords(record))
