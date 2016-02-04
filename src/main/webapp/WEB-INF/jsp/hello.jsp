<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page import="com.lucifer.sudoku.*, java.text.*" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>


<html>
<head>
    <title>Sudoku challenge!</title>
    <meta charset="utf-8">
    <script src="https://vk.com/js/api/xd_connection.js?2" type="text/javascript"></script>
    <script src="/resources/js/jquery-2.1.4.min.js"></script>
    <script src="/resources/js/singleton.sudoku.js"></script>
    <script src="resources/js/main_script.js" type="text/javascript"></script>

    <link rel="stylesheet" href="/resources/css/style.css">
    <link rel="icon" type="image/png" href="/resources/favicon.png" />
    <link href="/resources/css/bootstrap.min.css" rel="stylesheet">
    <link href="/resources/css/game.css" rel="stylesheet">

    <meta name="keywords" content="Sudoku головоломки судоку головоломка чемпионат " />
    <meta name="description" content="Головоломка" />
</head>
<body>
<section style="margin-top: 20px;">
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <center>
                    <div onclick="newGame()" class="btn btn-black">Игра</div>
                    <div onclick="highScore()" class="btn btn-black">Таблица лидеров</div>
                    <div onclick="invite()" class="btn btn-black">Пригласить друзей</div>
                    <div onclick="wall()" class="btn btn-black">Рассказать друзьям</div>
                </center>
            </div>
            <div class="col-md-6" id="points">

            </div>
            <div class="col-md-6" id="mainDiv" width="100%" height="30%">

            </div>
        </div>
    </div>
</section>
</body>
</html>