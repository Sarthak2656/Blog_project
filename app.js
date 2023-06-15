const express = require("express");
require('dotenv').config();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash"); 
var mongoose = require('mongoose');
var mongoDB = "mongodb+srv://"+process.env.user_pwd+"@cluster0.ofrw350.mongodb.net/blogDB";
mongoose.connect(mongoDB, { useNewUrlParser: true });

const bcrypt = require('bcrypt');
const saltRounds = 10;

const postSchema={
  title:String,
  content:String
};
const userSchema=new mongoose.Schema({
  username:String,
  password:String
});

const Post=mongoose.model("Post",postSchema);
const User=mongoose.model("User",userSchema);

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let pwd="";
bcrypt.hash(process.env.Pass,saltRounds,function(err,hash)
{
  if(err)
  console.log(err);
  else
  pwd=hash;
});

User.find({}).then(function(foundItems){
  if(foundItems.length===0)
  {
    const user=new User({
      username:process.env.USERN,
      password:pwd
    });
    user.save();
  }
});

app.get("/", function(req, res){

  Post.find({}).then(function(foundPosts)
  {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: foundPosts
    });
  }).catch(function(err)
  {
    console.log(err);
  });
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){

  res.render("login");
});

app.get("/login",function(req,res)
{
  res.render("login");
});

app.post("/login",function(req,res)
{
  uname=req.body.username;
  pass=req.body.password;
  User.find({username:uname}).then(function(foundUser)
  {
    if(foundUser.length===0){
      res.redirect("/login");
    }
    else
    {
      bcrypt.compare(pass,foundUser[0].password,function(err,result)
      {
        if(result===true)
        res.render("compose");
        else
        res.redirect("/login");
      });
    }
  });
});

app.post("/compose", function(req, res){
  const post = {
    title: req.body.postTitle,
    content: req.body.postBody
  };
  const newPost=new Post({
    title:post.title,
    content:post.content
  });
  newPost.save()
  res.redirect("/");
});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = req.params.postName; 
   Post.findById(requestedTitle).then(function(foundItem)
   {
    res.render("post",{
      title:foundItem.title,
      content:foundItem.content
    });
   })
});

let port=process.env.PORT;
if(port==null||port=="")
port=3000;

app.listen(port, function() {
  console.log("Server started!!");
});