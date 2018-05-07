var https = require('https');

module.exports = function (context, myTimer) {

function checkAlive() {
    var URL = 'https://healthtipsbot.azurewebsites.net/'

    // httpsでリクエスト送信
    var req = https.request(URL, function (res) {
        var code = res.statusCode;
        if (code != 200) {  // 200番正常レスポンス以外の場合
            var message = "【未病状態】 " + URL + " looks no good condition. - STATUS CODE " + code;
            context.log(message);
        }
        else{   // 正常な場合
            var message = "【健康】 " + URL + " : " + code;
            context.log(message);
            context.done();
        }
    });
    req.on('error', function (error) {  // エラー
        var message = "【危篤状態】" + URL + " is not been reached packets.";
        message += " - ERROR MESSAGE : " + error.message;
        context.log(message);
        context.done();
    });
    req.end();
}

checkAlive();


};
