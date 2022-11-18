//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://harshak02:jntucse1234@cluster0.sttwkrc.mongodb.net/todolistDB", {useNewUrlParser: true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item",itemsSchema);

const workItems = [];

const item1 = new Item({
  name : "Welcome to your to do list!"
});

const item2 = new Item({
  name : "Hit + item to add on new item"
});

const item3 = new Item({
  name : "<-- Hit this to delete an item"
});

defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find(function(err,itemsDetails){
    if(err){
      console.log(err);
    }
    else{
      if(itemsDetails.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
              console.log(err);
          }
          else{
              console.log("Go re!!");
          }
        });
        res.redirect("/");//imp when ever we get changes in database use this
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: itemsDetails});
      }
    }
  });
});

app.get("/:customListName",function(req,res){
  const customName = _.capitalize(req.params.customListName);

  List.findOne({name : customName},function(err,foundList){
    if(err){
      console.log("err");
    }
    else{
      if(!foundList){
        const list = new List({
          name : customName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemNames = req.body.newItem;
  const listName = req.body.list;
  const insItem = new Item({
    name : itemNames
  });

  if(listName === "Today"){
    insItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(insItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete", function(req, res){
  const delId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(delId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Done");
      }
      
    });
    res.redirect("/");
  }
  else{
    //deletes the item
    List.findOneAndUpdate({name : listName},{$pull : {items : {_id : delId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
