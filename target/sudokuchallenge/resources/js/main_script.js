/**
 * Main module of VK sudoku challenge.
 * @Author Igor Sobolev
 */
$(document).ready(function() {
    newGame();
});

/**
 * Draws points of current user.
 */
function drawPoints() {
    VK.api("users.get", {v: "5.35"}, function(callback) {
        if (callback.response.length > 0) {
            $.ajax({
                url: "/persons/login/",
                type: "POST",
                dataType: "json",
                data: callback.response[0],
                success: function(user) {
                    var html = "";
                    html += "<p style=\"text-align: center; margin-top: 20px; width=50%;\">Ваш счет: " + user.points + "</p><br>";
                    $("#points").html(html);
                },
                error: function() {
                    console.log("error loading profile");
                }
            });
        } else {
            return;
        }
    });
}

/**
 * Function that shows for user game form.
 */
function newGame() {
    drawPoints();
    var html = "<div style=\"text-align: center\"><form id=\"gameSettings\">";
    html += "Выберите сложность:<br>";
    html += "Легкий <input type=\"radio\" name=\"difficulty\" value=\"easy\" checked/><br>";
    html += "Средний <input type=\"radio\" name=\"difficulty\" value=\"medium\"/><br>";
    html += "Тяжелый <input type=\"radio\" name=\"difficulty\" value=\"high\"/><br>";
    html += "</form>";
    html += "<button class=\"btn btn-black\" onclick=\"takeGame()\" >Начать игру!</button> <br></div>";
    $("#mainDiv").html(html);
}

/**
 * Parses form into JSON.
 * @param $form target form for parse
 * @returns {Object} JSON from form
 */
function getJSON($form) {
    var jsonData = {};
    var formData = $form.serializeArray();
    $.each(formData, function() {
        if (jsonData[this.name]) {
            if (!jsonData[this.name].push) {
                jsonData[this.name] = [jsonData[this.name]];
            }
            jsonData[this.name].push(this.value || "");
        } else {
            jsonData[this.name] = this.value || "";
        }

    });
    return jsonData;
}

/**
 * Draws content and divs for game.
 */
function takeGame() {
    var settings = getJSON($("#gameSettings"));
    var html = "<center>";
    html += "<div id=\"container\"></div>";
    html += "	<div id=\"menu\" class=\"col-md-5\" style=\"margin-top: 20px\">";
    html += "		<button class=\"btn btn-black\" id=\"solve\">Сдаюсь!</button>";
    html += "		<button class=\"btn btn-black\" id=\"newgame\">Новая игра</button>";
    html += "		<button class=\"btn btn-black\" id=\"reset\">Сброс</button>";
    html += "	</div>";
    html += "<div id=\"timer\" class=\"col-md-5\" style=\"margin-top: 20px\"></div>";
    html += "</div></center>";
    $("#mainDiv").html(html);
    showBoard(settings);
}

/**
 * Initializing game board.
 * @param settings settings for game
 */
function showBoard(settings) {
    var game = Sudoku.getInstance(null);
    game.setDifficulty(settings.difficulty);

    $("#container").append(game.getGameBoard());

    $("#solve").click(function() {
        game.solve();
        $("#reset").attr("disabled", "disabled");
        $("#solve").attr("disabled", "disabled");
    });
    $("#newgame").click(function() {
        newGame();
    });
    $("#reset").click(function() {
        game.reset();
    });
}

/**
 * Realizes query to server to retrieve list of top players.
 */
function highScore() {
    drawPoints();

    $.ajax({
        url: "/persons/get_top/",
        type: "GET",
        dataType: "json",
        success: function(users) {
            var html = "";
            html += "<table class=\"table table:hover\" height=\"30%\">";
            html += "<tr><th>№</th><th>Пользователь</th><th>Очки</th></tr>";
            label: $.each(users, function(index, value) {
                html += "<tr><td>" + Number(index + 1) + "</td><td>" + value.fullName + "</td><td>" + Number(value.points) + "</td></tr>";
            });
            html += "</table>";
            $("#mainDiv").html(html);
        },
        error: function() {
            console.log("error loading top");
        }
    });
}

/**
 * Uses VK API to show invite box.
 */
function invite() {
    VK.callMethod("showInviteBox");
}

/**
 * Using VK API posts into wall of user advertisement.
 */
function wall() {
    VK.api("wall.post", {
        message: "Прими вызов! Играй в Sudoku Challenge! http://vk.com/app5010308_37864023",
        attachments: "http://vk.com/app5010308_37864023"
    }, function(data) {

    });
}