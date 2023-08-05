const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const uri = "mongodb+srv://khanzaid12296:test321@harrymongo.ke4i7ar.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true, useUnifiedTopology: true
},(err) => {
  if(err) {
    console.log(err)
  } else {
    console.log("successfully connected")
  }
}
);

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist!" 
});

const item2 = new Item({
  name: "hit the + button to add a new item"
});

const item3 = new Item({
  name: "hit back to delete an item"
});

const defaultItems = [item1, item2, item3]; 

const listSchema = {
  name: String,
  items: [itemsSchema] 
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0) {
       Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved default items");
        }
       });
       res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    
  });

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err) {
      if(!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          list: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err) {
      console.log("successfully deleted");
      res.redirect("/");
    }
   });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }

  
}); 

// app.post("/work", function(req, res){
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work")
// });

app.get("/about", function(req, res){
  res.render("about");
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});