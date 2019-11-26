// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");

var app = express();

var db = require("./models")

var PORT = process.env.PORT || 3000;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/Week-14", { useNewUrlParser: true });


app.get("/scrape", function(req, res) {
  axios.get("https://hyperallergic.com/articles/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".entry-exerpt").each(function(i, element) {
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");
      if (title && link) {
        db.scrapedData.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(inserted);
          }
        });
      }
    });
  });

  res.send("Scrape Complete");
});

app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

app.get("/articles/:id", function(req, res){
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
        res.json(err);
    }).catch(function(err){
        res.json(err);
    })
});

app.post("/articles/:id", function(req,res){
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findOneAndUpdate(
            {_id: req.params.id},
            {note: dbNote._id},
            {new: true}
        )
    }).then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    })
})


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
