/**
 * Created by marcel.ludwig on 18.12.15.
 * The part is Gamesparks cloudCode which have to be saved to System/CallbackUrl
 */

/**
 * Used by NodeBB login process
 * @param {Object} request requestData
 */
var findPlayerByLoginData = function (request) {
    var player = Spark.systemCollection("player").findOne({"userName" : request.username });
    if (player != null) {
        var sparkPlayer = Spark.loadPlayer(player._id.$oid);
        Spark.setScriptData("authentication", sparkPlayer.validatePassword(request.password) ? "success" : "failed");
        var playerPayload = {
            id : sparkPlayer.getPlayerId(),
            displayName : sparkPlayer.getDisplayName(),
            email : sparkPlayer.getUserName(),
            avatar : null
        };
        Spark.setScriptData("player", playerPayload);
    } else {
        Spark.setScriptData("authentication", "failed");
        Spark.setScriptError("message", "Player not found: " + request.username);
    }

};

var request = JSON.parse(Spark.getData().REQUEST_BODY);
if(request.userAgent && request.userAgent == 'NodeBB')
{
    findPlayerByLoginData(request);
}