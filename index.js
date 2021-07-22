const express = require('express');
const mongodb = require("mongodb");

const dbUrl = "mongodb+srv://surya-db:7Vv8LAnd3twYJYmo@cluster0.ptrbp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const app = express();
const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectID;

app.use(express.json());

app.listen(4000, () => console.log("App is running"));

app.get('/display-mentors', async(req,res) =>{
    try{
        let clientInfo = await mongoClient.connect(dbUrl);
        let db =  clientInfo.db("mentor");
        let data = await db.collection("mentor")
        .find()
        .toArray();
        res.status(200).json(data);
        clientInfo.close();
    }
    catch(error){
        console.log(error);
    }
});

app.get('/display-students', async(req,res) =>{
    try{
        let clientInfo = await mongoClient.connect(dbUrl);
        let db =  clientInfo.db("mentor");
        let data = await db.collection("student")
        .find()
        .toArray();
        res.status(200).json(data);
        clientInfo.close();
    }
    catch(error){
        console.log(error);
    }
});

app.post("/create-mentor", async ( req , res) =>{
    try {
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("mentor")
        await db.collection("mentor").insertOne(req.body);
        res.status(200).json({message : "Mentor  Created"})
        client.close();
    } catch (error) {
        console.log(error)
    }
})
app.post("/create-student", async ( req , res) =>{
    try {
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("mentor")
        await db.collection("student").insertOne(req.body);
        res.status(200).json({message : "Student Created"})
        client.close();
    } catch (error) {
        console.log(error)
    }
})

//Put request
app.put( "/student/:id", async (req,res)=>{
    try {
        let client = await mongoClient.connect(dbUrl);
        let newStudent = req.params.id;
        let db = client.db("mentor");
        let student = await db.collection("student").findOne({student_id : req.params.id});
        let stumen = student.mentor_id;
        if(stumen){
            res.status(200).json({ message : "Mentor already Assigned "});
        }
        else{
            await db.collection("student").findOneAndUpdate({student_id : req.params.id}, { $set : req.body});
            let mentor =  await db.collection("mentor").findOne({mentor_id : req.body.mentor_id});
            let newMentorArray = mentor.student_id;
            newMentorArray.push(newStudent);
            await db.collection("mentor").findOneAndUpdate({mentor_id : req.body.mentor_id }, { $set : { student_id : newMentorArray } });
        }
        res.status(200).json({ message : "Mentor Assigned "});
    } catch (error) {
        console.log(error)
    }
    
})

app.put('/mentor/:id', async( req , res ) =>{
    try {
        let client = await mongoClient.connect(dbUrl);
    let db = client.db("mentor");
    await db.collection("mentor").findOneAndUpdate({mentor_id : req.params.id}, { $set : req.body});

    let stuArr = req.body.student_id;
    for(i=0 ; i<stuArr.length ; i++){
        await db.collection("student").findOneAndUpdate({ student_id : stuArr[i]}, { $set :{ mentor_id : req.params.id } });
    }
    res.status(200).json({ message : "Mentor Assigned "});
    } catch (error) {
        console.log(error)
    }
    
});


// Display all students for a particular mentor
app.get('/display-mentees/:id', async(req,res) =>{
    try{
        let clientInfo = await mongoClient.connect(dbUrl);
        let db =  clientInfo.db("mentor");
        let data = await db.collection("mentor").findOne( { mentor_id : req.params.id})
        console.log(data.student_id)
        let stuArr = [];
        console.log(stuArr + "Stuarr");
        for( i =0 ; i <data.student_id.length ; i ++){
            let student = await db.collection("student").findOne( { student_id : data.student_id[i]});
            console.log(student);
            stuArr.push(student.student_name)
        }
        res.status(200).send(`<h1>Mentor Name : ${data.mentor_name}</h1>
                                <h2>Names of Students assigned ${stuArr}</h2>`);
        clientInfo.close();
    }
    catch(error){
        console.log(error);
    }
});



//Delete Request
app.delete( "/delete-student/:id", async (req,res)=>{
    try {
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("mentor");
        await db.collection("student").deleteOne({ student_id : req.params.id});
        res.status(200).json({ message : "User Deleted"});
        client.close()
    } catch (error) {
        console.log(error)
    }
    
})