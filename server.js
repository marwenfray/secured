const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
require("dotenv").config();
const connectDB = require("./config/connectDB");
const File = require('./models/File');


const app = express();
//adding the urlencoded middleware so that express can handle a multipart form
app.use(express.urlencoded({ extended: true }))
//connecting the database
connectDB()
//setting up multer, the uploaded file destination will be the folder uploads
const upload = multer({dest: "uploads"})
//setting the default view engine as ejs
app.set("view engine", "ejs")
//returning the index found in views as a default page
app.get("/", (req, res) => {
  res.render('index')
});
//uploading the file & adding a password
app.post("/upload", upload.single("file"),async (req, res) => { 
const fileData= {
    path: req.file.path,
    name:req.file.originalname
}
req.body.password? fileData.password= await bcrypt.hash(req.body.password, 10):0
const file = await File.create(fileData)
res.render("index",{fileLink:`${req.headers.origin}/file/${file.id}`})
});
//we are using route to use both post and get methods on the same line 
app.route("/file/:id").get(handleDownload).post(handleDownload)

//we have to create an async function to handle the download which will be used by both a post and a get method
async function handleDownload(req, res) {
    const file = await File.findById(req.params.id)
  
    if (file.password != null) {
      if (req.body.password == null) {
        res.render("password")
        return
      }
  
      if (!(await bcrypt.compare(req.body.password, file.password))) {
        res.render("password", { error: true })
        return
      }
    }
  //each time  someone downloads this file the counter goes up
    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)
  
    res.download(file.path, file.name)
  }
app.listen(process.env.PORT)