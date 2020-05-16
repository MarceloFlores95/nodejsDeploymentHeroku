const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose')
const validateToken = require('./middleware/validateToken');

const {Students} = require('./models/studentModel')
const {DATABASE_URL} = require('./config')

const app = express('');
const jsonParser = bodyParser.json();
// Morgan help to send message of GET/POST/DELETE in terminal, locks what is going in the endpoints
// bodyParser is necessary to send data to the body request



// Si pones un app.use, todos los endpoints tienen acceso a ese atributo

app.use( express.static( "public" ) );
app.use(morgan('dev')) 
app.use(validateToken);

// Todo lo que este adentro de la carpeta public lo pondra en el browser


let studentsList = [
    {
        name: "Luis",
        id: 123
    },
    {
        name: "Marcelo",
        id: 456
    },
    {
        name: "Jessica",
        id: 789
    }
]

function middleware(req,res,next) {
    console.log('Inside the middleware')

    let newObj = {};

    newObj = {
        test: "This message was added in the middleware"
    }
    req.test = newObj;

    next();
}

app.get('/api/students', (req,res) => {
    console.log("Gettig all list of students");
    // console.log(req.test);

    // console.log(req.headers);
    //  return res.status(200).json(studentsList);
    Students
        .getAllStudents()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err =>{
            res.statusMessage = "Something is wrong with the Database. Try again later."
            return res.status(500).end();
        })
});

app.get('/api/studentsById',(req,res) => {
    console.log("Getting one student given the id parameter.");
    console.log(req.query);
    
    let id = req.query.id;

    console.log('id',id);

    if (!id) {
        res.statusMessage = "The 'id' parameter is required";
        return res.status(406).end()
    }
    /*
    let result = studentsList.find((student) => {
        if(student.id == id) {
            return student;
        }
    });

    if(!result) {
        res.statusMessage=`The student with id=${id} was not found in the list.`;
        return res.status(404).end()
    }

    return res.status(200).json(result);
    */

   Students
        .getStudentsById(id)
        .then(result => {
            if (!result) {
                res.statusMessage=`The student with id=${id} was not found in the list.`;
                return res.status(404).end()
            } else {
                return res.status(200).json(result);
            }     
        })
        .catch(err =>{
            res.statusMessage = "Something is wrong with the Database. Try again later."
            return res.status(500).end();
        })
   })

app.get('/api/getStudentById/:id', (req,res) => {
    console.log("Getting one student given the id parameter.");
    console.log(req.params);

    let id = req.params.id;

    console.log('id',id);
    /*
    let result = studentsList.find((student) => {
        if(student.id == id) {
            return student;
        }
    });

    if(!result) {
        res.statusMessage=`The student with id=${id} was not found in the list.`;
        return res.status(404).end()
    }

    return res.status(200).json(result);
    */
   Students
   .getStudentsById(id)
   .then(result => {
       if (!result) {
           res.statusMessage=`The student with id=${id} was not found in the list.`;
           return res.status(404).end()
       } else {
           return res.status(200).json(result);
       }     
   })
   .catch(err =>{
       res.statusMessage = "Something is wrong with the Database. Try again later."
       return res.status(500).end();
   })

})

app.post('/api/addStudent',jsonParser,(req,res) => {
    
    console.log("body",req.body);

    let id = req.body.id;
    let name = req.body.name;

    if(!id || !name) {
        res.statusMessage = "One of these parameters is missing in the request: 'id', 'name'" 
        return res.status(406).end()
    }

    if(typeof(id) !== 'number') {
        res.statusMessage ="The 'id' MUST be a number"
        return res.status(409).end();
    }
    /*
    let flag = true;

    for(let i = 0; i< studentsList.length;i++) {
        if(studentsList[i].id == id) {
            flag = !flag;
            break;
        }
    }

    if(flag) {
        let newStudent = {
            id: id,
            name: name
        };

        studentsList.push(newStudent);

        return res.status(201).json({});
    } else {
        res.statusMessage = "The 'id' is already on the list"
        return res.status(409).json({});
    }
    */

    let newStudent = {name, id};
    Students
        .createStudent(newStudent)
        .then(result => {
            // Handle id duplicate error
            if(result.errmsg) {
                res.statusMessage = "The 'id' belongs to another student." + 
                        result.errmsg;
                    return res.status(400).end()
            }
            return res.status(201).json(result);
        })
        .catch(err => {
            res.statusMessage = "Something is wrong with the Database. Try again later.";
            return res.status(500).end();
        })
    
})

app.delete('/api/removeStudent', (req,res) => {
    let id = req.query.id;
    
    if(!id) {
        res.statusMessage = "Please send the 'id' as a parameter.";
        return res.status(406).end()
    }
    /*
    let studentToRemove = studentsList.findIndex((student) => {
        if(student.id === Number(id)) {
            return true;
        }
        
    });

    if(studentToRemove < 0) {
        res.statusMessage = "That 'id' was not found in the student list.";
        return res.status(400).end();
    } else {
        studentsList.splice( studentToRemove, 1 );
        return res.status(204).end();
    }
    */
    Students
        .deleteStudentById(id)
            .then(result => {
                if(!result) {
                    res.statusMessage = "That 'id' was not found in the student list.";
                    return res.status(400).end();
                } else {
                    return res.status(204).end();
                } 
               
            })
            .catch(err =>{
                res.statusMessage = "Something is wrong with the Database. Try again later."
                return res.status(500).end();
            })

})

app.listen(8080, () => {
    console.log("This server is running on port 8080");

    new Promise((resolve, reject) => {
        const settings = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        };
        mongoose.connect(DATABASE_URL, settings,(err) => {
        //mongoose.connect('mongodb+srv://luismarcelofc:admin@cluster0-gafxn.mongodb.net/students?retryWrites=true&w=majority', settings,(err) => {
            if(err) {
                return reject(err);
            }
            else {
                console.log("Database connected succesfully")
                return resolve();
            }
        })
    })
    .catch(err => {
        console.log(err)
    })

})

// Base url: http://localhost:8080
// GET endpoint: http://localhost:8080/api/students
// GET by id in query : http://localhost:8080/api/studentsById?id=123
// GET by id in param : http://localhost:8080/api/getStudentById/123
// POST a new student: http://localhost:8080/api/addStudent
// DELETE a student: http://localhost:8080/api/removeStudent