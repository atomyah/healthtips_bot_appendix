var express = require('express')
var Twitter = require('twitter')
var CronJob = require("cron").CronJob
var mysql = require('mysql')

var app = express()


var twitter = new Twitter({
  consumer_key: process.env['CONSUMER_KEY'],
  consumer_secret: process.env['CONSUMER_SECRET'],
  access_token_key: process.env['ACCESS_TOKEN_KEY'],
  access_token_secret: process.env['ACCESS_TOKEN_SECRET']
})




//9~22時の間に3時間ごと
// var cronTime = '0 0 0-13/3 * * *'

//毎分0秒
var cronTime = '0 * * * * *'

new CronJob({
  cronTime: cronTime,
  onTick: function() {
    cycleTweet()
  },
  start: true
})


// Azure MySQL In App接続詞
var connectionString = process.env.MYSQLCONNSTR_localdb;

var host = /Data Source=([0-9\.]+)\:[0-9]+\;/g.exec(connectionString)[1];
var port = /Data Source=[0-9\.]+\:([0-9]+)\;/g.exec(connectionString)[1];
var database = /Database=([0-9a-zA-Z]+)\;/g.exec(connectionString)[1];
var username = /User Id=([a-zA-z0-9\s]+)\;/g.exec(connectionString)[1];
var password = /Password=(.*)/g.exec(connectionString)[1];

var connection = mysql.createConnection({
  host: host,
  port: port,
  user: username,
  password: password,
  database: database
})



function cycleTweet() {

  connection.query('select tips from tips order by rand() limit 1', function(err, rows) {
    if(err) {
      return console.log(err)
    }else{
      tips = rows[0].tips
      console.log(tips)

      // 自動投稿
      twitter.post('statuses/update', {status: tips}, (err, tweet, response)=> {
        if(err) {
          return console.log(err)
        }else{
          return console.log(tweet)
        }
      })

    }
  })

}



// イベント受信用のstream取得
var stream = twitter.stream('user')

// フォローしてきた相手をフォローする。 鍵アカからのフォローはfollowイベント発火しない。
stream.on('follow', function(data) {

  var param = { user_id: data.source.id_str }
  var screenName = data.source.screen_name
  var MY_OWN_ID_STR = '989423028546097152'

  console.log("stream on! followed by " + data.source.screen_name + " and its id_str is " + data.source.id_str)

  if( data.source.id_str === MY_OWN_ID_STR) return
  // MY_OWN_ID_STRを環境変数に設定するならこちら
  // if( data.source.id_str === process.env['MY_OWN_ID_STR']) return

  twitter.post('friendships/create', param, function(err, tweet, response) {})


  console.log("follow event is runnning")

  //お礼をツイート
  tweetNow('@' + screenName + ' さん、フォローありがとうございます！')

})


// フォローありがとうございます返信リプ用の関数
function tweetNow(arg) {
  twitter.post('statuses/update', {status: arg}, function(err, tweet, response) {
    if(err) {
      return console.log(err)
    }else{
      return console.log(tweet)
    }
  })
}



app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
    res.send('Hello World')
})

app.listen(app.get('port'), function() {
  console.log("Node app is runnning at localhost:" + app.get('port'))
})
