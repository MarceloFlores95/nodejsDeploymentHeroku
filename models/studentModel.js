const mongoose = require('mongoose')

const studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true,
        unique: true
    }
});

const studentsCollection = mongoose.model('students', studentSchema);

const Students = {
    // The two ways are correct
    /*
    nameProperty : function() {

    },

    nameProperty() {

    }
    */
   createStudent : function(newStudent) {
       return studentsCollection // db.students.insert(newStudent)
                .create(newStudent)
                .then(createStudent =>{
                    return createStudent;
                })
                .catch(err => {
                    return err;
                });
   },
   getAllStudents : function() {
       return studentsCollection
                .find()
                .then(allStudents => {
                    return allStudents
                })
                .catch(err => {
                    return err
                })
   },
   getStudentsById : function(studentId) {
        const filter = {id : studentId};
        return studentsCollection
                .find(filter)
                .then(studentById => {
                    console.log(studentById)
                    if (studentById.length < 1)
                        return undefined
                    else
                        return studentById
                })
                .catch(err => {
                    return err
                })
   },
   deleteStudentById : function (studentId) {
        const filter = {id: studentId};
        return studentsCollection
                    .deleteOne(filter)
                        .then(deleted => {
                            if(deleted.n == 0) {
                                return undefined
                            } else {
                                return true
                            } 
                        })
                        .catch(err => {
                            return err
                        })
   }
}

module.exports = {Students};