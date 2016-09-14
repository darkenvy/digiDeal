// ---------------------- Init ------------------------- //
var express = require('express');
var FeedParser = require('feedparser');
var htmlparser = require("htmlparser2");
var request = require('request');
var dealsReq = request('https://isthereanydeal.com/rss/deals/us/');
var db = require('./models');
var feedparser = new FeedParser({addmeta: false});
var reg = new RegExp(/isthereanydeal/)
var priceReg = new RegExp(/\d+\.\d+/)
var app = express();
var gamelist = [];
app.use(express.static(__dirname + '/builds/development'));

// -------------------- Database ------------------------ //
var checkEntry = function(item) {
  // Check Entry will check for an entry, create it as well as retrieve box art
  if (item) {
    console.log("=========================================");
    console.log("checkEntry: ", item.name);
    
    // Find or create in database now that we have boxart
    db.gamedeal.findOrCreate({
      where: {name: item.name},
      defaults: {link: item.link}
    }).spread(function(game, created) {
      if (created) {
        // Find the game art
        var url = 'http://www.giantbomb.com/api/search' + '?api_key=cd11d03f7a6fdf2162a12561c724593984a6d5b3' + '&query=' + encodeURI(item.name) + '&format=json&resources=game' + '&limit=1&field_list=name,image';
        var options = {url: url, headers: {'User-Agent': 'DealFinder:RenoMcKenzie.com'}}
        request(options, function(error, response, body) {
          if (error) {console.log("ERROR: ", error);} 
          else if (body) {
            var imageUrl = JSON.parse(body);
            if (imageUrl.results && imageUrl.results[0] && imageUrl.results[0].image) {
              // Game art found, now add to DB
              console.log('Found boxart: ', imageUrl.results[0].image.small_url);
              game.boxart = imageUrl.results[0].image.small_url;
              game.save();
            } 
          }
        });

      }
    })
 
  }
}

// ------------------ HTML Parser ----------------------- //
var parser = new htmlparser.Parser({
  onopentag: function(name, attribs){
    if (attribs.href && reg.test(attribs.href)) {
      // New title discovered, create a new item
      // But only after shoving that last (now completed) item into 'checkEntry'
      checkEntry(gamelist[gamelist.length-1]);

      // Each information piece will add to the last element in the array
      // console.log("=========================================");
      gamelist.push({name: '', price: null, savings: null, link: ''}); // Add a new item
      // console.log("attribs: ", attribs.href)
    } else if (attribs.href && gamelist[gamelist.length-1].link.length < 1) {
      gamelist[gamelist.length-1].link = attribs.href; // Add Link
      // console.log("attribs: ", attribs.href);
    }
  },
  ontext: function(text){
    if (/\$/.test(text)) {
      if (gamelist[gamelist.length-1].price === null) {
        gamelist[gamelist.length-1].price = priceReg.exec(text)[0]; // Add price
        // console.log(text);
      }
    } else if (/\%/.test(text)) {
      if (gamelist[gamelist.length-1].savings === null) {
        gamelist[gamelist.length-1].savings = parseInt(text); // Add Savings %
        // console.log(text); 
      }
    } else if (gamelist[gamelist.length-1] && gamelist[gamelist.length-1].name.length < 1) {
      gamelist[gamelist.length-1].name = text; // Add name of game
      // console.log(text); 
    }
  },
  onclosetag: function(tagname){}
}, {decodeEntities: true});

// -------- Initialize gamelist on start of node -------- //
dealsReq.on('error', function (error) {console.log(error);});
dealsReq.on('response', function (res) {
  var stream = this;
  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
  stream.pipe(feedparser);
});
feedparser.on('error', function(error) {console.log(error);});
feedparser.on('readable', function() {
  // **NOTE** the "meta" is always available in the context of the feedparser instance
  var stream = this, meta = this.meta, item;
  while (item = stream.read()) {
    parser.write(JSON.stringify(item.description));
    parser.end();
  }
});
// ----------------- Get Gameart on request ------------- //


// var getGameArt = function(searchTerm, res) {
//   var url = 'http://www.giantbomb.com/api/search' + 
//       '?api_key=cd11d03f7a6fdf2162a12561c724593984a6d5b3' + 
//       '&query=' + searchTerm + '&format=json&resources=game' + 
//       '&limit=1&field_list=name,image';
//   var options = {
//     url: url,
//     headers: {'User-Agent': 'DealFinder:RenoMcKenzie.com'}
//   }
//   request(options, function(error, response, body) {
//     if (error) {
//       res.send(error);
//     } else {
//       res.send(JSON.parse(body).results);
//     }
//   });
// }

// ------------------- CORS Middleware ------------------ //
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// ----------------------- Routes ----------------------- //

app.get('/api/game/:name', function(req, res) {
  db.gamedeal.findOne({
    where: {name: req.params.name}
  }).then(function(game) {
    if (game) {res.redirect(game.boxart)}
    else {res.send('not found')}
  })

})

app.get('/api/deals', function(req, res) {
  res.send(JSON.stringify(gamelist))
})





var server = app.listen(3000) // port 8080