import express from 'express'

const app = express();


app.get('/' , (req , res)=>{
    res.json({message : "Hello World"});
})

app.listen(8000 , ()=>{
    console.log("APp Running on Port 8000");
})