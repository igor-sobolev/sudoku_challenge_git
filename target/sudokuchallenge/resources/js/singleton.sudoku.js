/**
 * A Javascript implementation of a Sudoku game, including a
 * backtracking algorithm solver. For example usage see the
 * attached index.html demo.
 * Modified by Igor Sobolev.
 * @author Moriel Schottlender
 */
var Sudoku = (function($) {
    var _instance, _game,
        /**
         * Default configuration options. These can be overriden
         * when loading a game instance.
         * @property {Object}
         */
        defaultConfig = {
            // If set to true, the game will validate the numbers
            // as the player inserts them. If it is set to false,
            // validation will only happen at the end.
            "validate_on_insert": true,
            // If set to true, the system will display the elapsed
            // time it took for the solver to finish its operation.
            "show_solver_timer": true,
            // If set to true, the recursive solver will count the
            // number of recursions and backtracks it performed and
            // display them in the console.
            "show_recursion_counter": true,
            // If set to true, the solver will test a shuffled array
            // of possible numbers in each empty input box.
            // Otherwise, the possible numbers are ordered, which
            // means the solver will likely give the same result
            // when operating in the same game conditions.
            "solver_shuffle_numbers": true,
            // Difficulty (fill power)
            "difficulty": "easy"
        },
        paused = false,
        counter = 0;

    /**
     * Initialize the singleton.
     * @param {Object} config Configuration options
     * @returns {Object} Singleton methods
     */
    function init(config) {
        conf = $.extend({}, defaultConfig, config);
        _game = new Game(conf);

        /** Public methods **/
        return {
            /**
             * Return a visual representation of the board
             * @returns {jQuery} Game table
             */
            getGameBoard: function() {
                _game.startTimer();
                return _game.buildGUI();
            },

            /**
             * Reset the game board.
             */
            reset: function() {
                _game.startTimer();
                _game.resetGame();
            },

            /**
             * Call for a validation of the game board.
             * @returns {Boolean} Whether the board is valid
             */
            validate: function() {
                var isValid = _game.validateMatrix();
                $(".sudoku-container").toggleClass("valid-matrix", isValid);
            },

            /**
             * Setting difficulty of game.
             */
            setDifficulty: function(difficulty) {
                _game.config.difficulty = difficulty;
            },

            /**
             * Call for the solver routine to solve the current
             * board.
             */
            solve: function() {
                _game.resetGame();
                var isValid, starttime, endtime, elapsed;

                if (!_game.validateMatrix()) {                                  // Make sure the board is valid first
                    return false;
                }

                _game.recursionCounter = 0;                                     // Reset counters
                _game.backtrackCounter = 0;
                starttime = Date.now();                                         // Check start time
                isValid = _game.solveGame(0, 0);                                // Solve the game
                endtime = Date.now();                                           // Get solving end time

                $(".sudoku-container").toggleClass("valid-matrix", isValid);    // Visual indication of whether the game was solved
                if (isValid) {
                    $(".valid-matrix input").attr("disabled", "disabled");
                }

                if (_game.config.show_solver_timer) {                           // Display elapsed time
                    elapsed = endtime - starttime;
                    window.console.log("Solver elapsed time: " + elapsed + "ms");
                }

                if (_game.config.show_recursion_counter) {                      // Display number of reursions and backtracks
                    window.console.log("Solver recursions: " + _game.recursionCounter);
                    window.console.log("Solver backtracks: " + _game.backtrackCounter);
                }

                _game.stopTimer();                                              //stop timer after solving
            }
        };
    }

    /**
     * Sudoku singleton engine.
     * @param {Object} config Configuration options
     */
    function Game(config) {
        this.config = config;

        // Initialize game parameters
        this.recursionCounter = 0;
        this.$cellMatrix = {};
        this.matrix = {};
        this.validation = {};
        this.task = {};
        this.timer = 0;
        this.time();
        this.resetValidationMatrices();
        return this;
    }

    /**
     * Game engine prototype methods.
     * @property {Object}
     */
    Game.prototype = {
        /**
         * Game timer value.
         * @returns {Number} value of timer.
         */
        time: function() {
            return 0;//next time replaced in implementation of timer
        },

        /**
         * Build the game GUI.
         * @returns {jQuery} Table containing 9x9 input matrix
         */
        buildGUI: function() {
            var $td, $tr, $table = $("<table>").addClass("sudoku-container");

            for (var i = 0; i < 9; i++) {
                $tr = $("<tr>");
                this.$cellMatrix[i] = {};
                this.task[i] = {};

                for (var j = 0; j < 9; j++) {
                    // Build the input
                    this.$cellMatrix[i][j] = $("<input>")
                        .attr("maxlength", 1)
                        .data("row", i)
                        .data("col", j)
                        .on("keyup", $.proxy(this.onKeyUp, this));

                    $td = $("<td>").append(this.$cellMatrix[i][j]);
                    // Calculate section ID
                    sectIDi = Math.floor(i / 3);
                    sectIDj = Math.floor(j / 3);
                    // Set the design for different sections
                    if ((sectIDi + sectIDj) % 2 === 0) {
                        $td.addClass("sudoku-section-one");
                    } else {
                        $td.addClass("sudoku-section-two");
                    }
                    // Build the row
                    $tr.append($td);
                }
                // Append to table
                $table.append($tr);
            }
            // Return the GUI table
            this.initGameWithNums();
            return $table;
        },

        /**
         * Handle keyup events.
         *
         * @param {jQuery.event} e Keyup event
         */
        onKeyUp: function(e) {
            var sectRow, sectCol, secIndex,
                starttime, endtime, elapsed,
                isValid = true,
                val = $.trim($(e.currentTarget).val()),
                row = $(e.currentTarget).data("row"),
                col = $(e.currentTarget).data("col");

            // Reset board validation class
            $(".sudoku-container").removeClass("valid-matrix");

            // Validate, but only if validate_on_insert is set to true
            if (this.config.validate_on_insert) {
                isValid = this.validateNumber(val, row, col, this.matrix.row[row][col]);
                // Indicate error
                $(e.currentTarget).toggleClass("sudoku-input-error", !isValid);
            }

            // Calculate section identifiers
            sectRow = Math.floor(row / 3);
            sectCol = Math.floor(col / 3);
            secIndex = (row % 3) * 3 + (col % 3);

            // Cache value in matrix
            this.matrix.row[row][col] = val;
            this.matrix.col[col][row] = val;
            this.matrix.sect[sectRow][sectCol][secIndex] = val;

            this.solved();
        },

        /**
         * Procedure after solving.
         */
        solved: function() {
            var isFull = true;//boolean check if board is not contains null inputs
            if (this.validateMatrix()) {
                for (var i = 0; i < 9; i++) {
                    for (var j = 0; j < 9; j++) {
                        if (this.matrix.row[i][j] == "") {
                            isFull = false;
                        }
                    }
                }
                if (isFull) {
                    alert("Решено!");
                    var points = 0;
                    switch (this.config.difficulty) {
                        case "easy":
                            points = 300 - time();
                            if (points < 0) points = 0;
                            points += 50;
                            break;
                        case "medium":
                            points = 450 - time();
                            if (points < 0) points = 0;
                            points += 150;
                            break;
                        case "high":
                            points = 600 - time();
                            if (points < 0) points = 0;
                            points += 300;
                            break;
                        default:
                            points = 0;
                    }

                    for (var i = 0; i < 9; i++) {
                        for (var j = 0; j < 9; j++) {
                            this.$cellMatrix[i][j].attr("disabled", "disabled");
                        }
                    }
                    this.stopTimer();

                    VK.api("users.get", {v: "5.35"}, function(callback) {
                        callback.response[0].points = points;
                        if (callback.response.length > 0) {
                            $.ajax({
                                url: "/persons/solved/",
                                type: "POST",
                                dataType: "json",
                                data: callback.response[0],
                                success: function(user) {
                                    var html = "";
                                    html += "<p style=\"text-align: center; margin-top: 20px; width=50%;\">Ваш счет: " + user.points + "</p><br>";
                                    $("#points").html(html);
                                },
                                error: function() {
                                    console.log("error post solve");
                                }
                            });
                        } else {
                            return;
                        }
                    });

                    $('#reset').attr('disabled', 'disabled');
                    $('#solve').attr('disabled', 'disabled');
                }
            }
        },

        /**
         * Start game timer.
         */
        startTimer: function() {
            if (this.timer) clearInterval(this.timer);
            var secs = 0;
            $("#timer").html("Время: " + secs + " сек.");
            this.timer = setInterval(function() {
                secs++;
                this.time = function() {
                    return secs;
                };
                $("#timer").html("Время: " + secs + " сек.");
            }, 1000);
        },

        /**
         * Stop game timer.
         */
        stopTimer: function() {
            if (this.timer) clearInterval(this.timer);
        },

        /**
         * Clear the board and the game parameters.
         */
        clearBoard: function() {
            this.resetValidationMatrices();
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    // Reset GUI inputs
                    this.$cellMatrix[row][col].val("");
                    this.matrix.row[row][col] = "";
                    this.matrix.col[col][row] = "";
                    var sectRow = Math.floor(row / 3);
                    var sectCol = Math.floor(col / 3);
                    var secIndex = (row % 3) * 3 + (col % 3);
                    this.matrix.sect[sectRow][sectCol][secIndex] = "";
                }
            }

            $(".sudoku-container input").removeAttr("disabled");
            $(".sudoku-container").removeClass("valid-matrix");
        },

        /**
         * Reset the board and the game parameters.
         */
        resetGame: function() {
            this.resetValidationMatrices();
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    // Reset GUI inputs
                    this.$cellMatrix[row][col].val(this.task[row][col]);
                    this.$cellMatrix[row][col].removeClass("sudoku-input-error");
                    var sectRow = Math.floor(row / 3);
                    var sectCol = Math.floor(col / 3);
                    var secIndex = (row % 3) * 3 + (col % 3);
                    this.matrix.row[row][col] = this.task[row][col];
                    this.matrix.col[col][row] = this.task[row][col];
                    this.matrix.sect[sectRow][sectCol][secIndex] = this.task[row][col];
                }
            }

            $(".sudoku-container input").removeAttr("disabled");
            $(".sudoku-container").removeClass("valid-matrix");
        },

        /**
         * Reset and rebuild the validation matrices.
         */
        resetValidationMatrices: function() {
            this.matrix = {"row": {}, "col": {}, "sect": {}};
            this.validation = {"row": {}, "col": {}, "sect": {}};

            // Build the row/col matrix and validation arrays
            for (var i = 0; i < 9; i++) {
                this.matrix.row[i] = ["", "", "", "", "", "", "", "", ""];
                this.matrix.col[i] = ["", "", "", "", "", "", "", "", ""];
                this.validation.row[i] = [];
                this.validation.col[i] = [];
            }

            // Build the section matrix and validation arrays
            for (var row = 0; row < 3; row++) {
                this.matrix.sect[row] = [];
                this.validation.sect[row] = {};
                for (var col = 0; col < 3; col++) {
                    this.matrix.sect[row][col] = ["", "", "", "", "", "", "", "", ""];
                    this.validation.sect[row][col] = [];
                }
            }
        },

        /**
         * Validate the current number that was inserted.
         *
         * @param {String} num The value that is inserted
         * @param {Number} rowID The row the number belongs to
         * @param {Number} colID The column the number belongs to
         * @param {String} oldNum The previous value
         * @returns {Boolean} Valid or invalid input
         */
        validateNumber: function(num, rowID, colID, oldNum) {
            var isValid = true,
            // Section
                sectRow = Math.floor(rowID / 3),
                sectCol = Math.floor(colID / 3);

            // This is given as the matrix component (old value in
            // case of change to the input) in the case of on-insert
            // validation. However, in the solver, validating the
            // old number is unnecessary.
            oldNum = oldNum || "";

            // Remove oldNum from the validation matrices,
            // if it exists in them.
            if (this.validation.row[rowID].indexOf(oldNum) > -1) {
                this.validation.row[rowID].splice(
                    this.validation.row[rowID].indexOf(oldNum), 1
                );
            }
            if (this.validation.col[colID].indexOf(oldNum) > -1) {
                this.validation.col[colID].splice(
                    this.validation.col[colID].indexOf(oldNum), 1
                );
            }
            if (this.validation.sect[sectRow][sectCol].indexOf(oldNum) > -1) {
                this.validation.sect[sectRow][sectCol].splice(
                    this.validation.sect[sectRow][sectCol].indexOf(oldNum), 1
                );
            }
            // Skip if empty value

            if (num !== "") {


                // Validate value
                if (
                    // Make sure value is numeric
                $.isNumeric(num) &&
                    // Make sure value is within range
                Number(num) > 0 &&
                Number(num) <= 9
                ) {
                    // Check if it already exists in validation array
                    if (
                        $.inArray(num, this.validation.row[rowID]) > -1 ||
                        $.inArray(num, this.validation.col[colID]) > -1 ||
                        $.inArray(num, this.validation.sect[sectRow][sectCol]) > -1
                    ) {
                        isValid = false;
                    } else {
                        isValid = true;
                    }
                }

                // Insert new value into validation array even if it isn"t
                // valid. This is on purpose: If there are two numbers in the
                // same row/col/section and one is replaced, the other still
                // exists and should be reflected in the validation.
                // The validation will keep records of duplicates so it can
                // remove them safely when validating later changes.
                this.validation.row[rowID].push(num);
                this.validation.col[colID].push(num);
                this.validation.sect[sectRow][sectCol].push(num);
            }

            return isValid;
        },

        /**
         * Validate the entire matrix.
         * @returns {Boolean} Valid or invalid matrix
         */
        validateMatrix: function() {
            var isValid, val, $element,
                hasError = false;

            // Go over entire board, and compare to the cached
            // validation arrays
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    val = this.matrix.row[row][col];
                    // Validate the value
                    isValid = this.validateNumber(val, row, col, val);
                    this.$cellMatrix[row][col].toggleClass("sudoku-input-error", !isValid);
                    if (!isValid) {
                        hasError = true;
                    }
                }
            }
            return !hasError;
        },

        /**
         * A recursive "backtrack" solver for the
         * game. Algorithm is based on the StackOverflow answer
         * http://stackoverflow.com/questions/18168503/recursively-solving-a-sudoku-puzzle-using-backtracking-theoretically
         */
        solveGame: function(row, col) {
            var cval, sqRow, sqCol, $nextSquare, legalValues,
                sectRow, sectCol, secIndex, gameResult;

            this.recursionCounter++;
            $nextSquare = this.findClosestEmptySquare(row, col);
            if (!$nextSquare) {
                // End of board
                return true;
            } else {
                sqRow = $nextSquare.data("row");
                sqCol = $nextSquare.data("col");
                legalValues = this.findLegalValuesForSquare(sqRow, sqCol);

                // Find the segment id
                sectRow = Math.floor(sqRow / 3);
                sectCol = Math.floor(sqCol / 3);
                secIndex = (sqRow % 3) * 3 + (sqCol % 3);

                // Try out legal values for this cell
                for (var i = 0; i < legalValues.length; i++) {
                    cval = legalValues[i];
                    // Update value in input
                    $nextSquare.val(cval);
                    // Update in matrices
                    this.matrix.row[sqRow][sqCol] = cval;
                    this.matrix.col[sqCol][sqRow] = cval;
                    this.matrix.sect[sectRow][sectCol][secIndex] = cval;

                    // Recursively keep trying
                    if (this.solveGame(sqRow, sqCol)) {
                        return true;
                    } else {
                        // There was a problem, we should backtrack
                        this.backtrackCounter++;

                        // Remove value from input
                        this.$cellMatrix[sqRow][sqCol].val("");
                        // Remove value from matrices
                        this.matrix.row[sqRow][sqCol] = "";
                        this.matrix.col[sqCol][sqRow] = "";
                        this.matrix.sect[sectRow][sectCol][secIndex] = "";
                    }
                }
                // If there was no success with any of the legal
                // numbers, call backtrack recursively backwards
                return false;
            }
        },

        /**
         * Builds game like solver.
         */
        buildGame: function(row, col) {
            var cval, sqRow, sqCol, $nextSquare, legalValues,
                sectRow, sectCol, secIndex;

            $nextSquare = this.findClosestEmptySquare(row, col);
            if (!$nextSquare) {
                // End of board
                return true;
            } else {
                sqRow = $nextSquare.data("row");
                sqCol = $nextSquare.data("col");
                legalValues = this.findLegalValuesForSquare(sqRow, sqCol);

                // Find the segment id
                sectRow = Math.floor(sqRow / 3);
                sectCol = Math.floor(sqCol / 3);
                secIndex = (sqRow % 3) * 3 + (sqCol % 3);

                // Try out legal values for this cell
                for (var i = 0; i < legalValues.length; i++) {
                    cval = legalValues[i];
                    // Update value in input
                    $nextSquare.val(cval);
                    // Update in matrices
                    this.matrix.row[sqRow][sqCol] = cval;
                    this.matrix.col[sqCol][sqRow] = cval;
                    this.matrix.sect[sectRow][sectCol][secIndex] = cval;
                    this.task[sqRow][sqCol] = cval;
                    $nextSquare.addClass("task");

                    if (this.buildGame(sqRow, sqCol)) {
                        return true;
                    } else {
                        this.$cellMatrix[sqRow][sqCol].val("");
                        this.matrix.row[sqRow][sqCol] = "";
                        this.matrix.col[sqCol][sqRow] = "";
                        this.matrix.sect[sectRow][sectCol][secIndex] = "";
                        this.task[sqRow][sqCol] = "";
                    }
                }
                return false;
            }
        },


        /**
         * Initializing game board.
         *
         * @param {Number} row Row id
         * @param {Number} col Column id
         * @returns {Boolean} true if all is OK
         */
        initGameWithNums: function() {
            this.clearBoard();
            var count = 0, numberOfDigs;
            switch (this.config.difficulty) {
                case "easy":
                    numberOfDigs = 41;
                    break;
                case "medium":
                    numberOfDigs = 37;
                    break;
                case "high":
                    numberOfDigs = 29;
                    break;
                default:
                    numberOfDigs = 0;
            }
            if (!numberOfDigs) {
                console.log("DIFFICULTY IS UNDEFINED!");
                return false;
            }
            this.buildGame(0, 0);
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    this.$cellMatrix[i][j].attr("disabled", "disabled");
                    this.task[i][j] = this.matrix.row[i][j];
                }
            }
            while (count++ < 81 - numberOfDigs) {
                var $nextSquare = 0;
                while (!$nextSquare) {
                    var randi = Math.floor(Math.random() * 10);
                    var randj = Math.floor(Math.random() * 10);
                    $nextSquare = this.findClosestNotEmptySquare(randi, randj);
                }
                var sqRow = $nextSquare.data("row");
                var sqCol = $nextSquare.data("col");
                var sectRow = Math.floor(sqRow / 3);
                var sectCol = Math.floor(sqCol / 3);
                var secIndex = (sqRow % 3) * 3 + (sqCol % 3);
                $nextSquare.val("");
                $nextSquare.removeAttr("disabled");
                this.matrix.row[sqRow][sqCol] = "";
                this.matrix.col[sqCol][sqRow] = "";
                this.matrix.sect[sectRow][sectCol][secIndex] = "";
                this.task[sqRow][sqCol] = "";
                $nextSquare.removeClass("task");
            }
            return true;
        },

        /**
         * Find closest empty square relative to the given cell.
         *
         * @param {Number} row Row id
         * @param {Number} col Column id
         * @returns {jQuery} Input element of the closest empty
         *  square
         */
        findClosestEmptySquare: function(row, col) {
            var walkingRow, walkingCol, found = false;
            for (var i = (col + 9 * row); i < 81; i++) {
                walkingRow = Math.floor(i / 9);
                walkingCol = i % 9;
                if (this.matrix.row[walkingRow][walkingCol] === "") {
                    found = true;
                    return this.$cellMatrix[walkingRow][walkingCol];
                }
            }
        },

        /**
         * Find closest not empty square relative to the given cell.
         *
         * @param {Number} row Row id
         * @param {Number} col Column id
         * @returns {jQuery} Input element of the closest empty
         *  square
         */
        findClosestNotEmptySquare: function(row, col) {
            var walkingRow, walkingCol, found = false;

            for (var i = (col + 9 * row); i < 81; i++) {
                walkingRow = Math.floor(i / 9);
                walkingCol = i % 9;
                if (this.matrix.row[walkingRow][walkingCol] !== "") {
                    found = true;
                    return this.$cellMatrix[walkingRow][walkingCol];
                }
            }
        },

        /**
         * Find the available legal numbers for the square in the
         * given row and column.
         *
         * @param {Number} row Row id
         * @param {Number} col Column id
         * @returns {Array} An array of available numbers
         */
        findLegalValuesForSquare: function(row, col) {
            var legalVals, legalNums, val, i,
                sectRow = Math.floor(row / 3),
                sectCol = Math.floor(col / 3);

            legalNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            // Check existing numbers in col
            for (i = 0; i < 9; i++) {
                val = Number(this.matrix.col[col][i]);
                if (val > 0) {
                    // Remove from array
                    if (legalNums.indexOf(val) > -1) {
                        legalNums.splice(legalNums.indexOf(val), 1);
                    }
                }
            }

            // Check existing numbers in row
            for (i = 0; i < 9; i++) {
                val = Number(this.matrix.row[row][i]);
                if (val > 0) {
                    // Remove from array
                    if (legalNums.indexOf(val) > -1) {
                        legalNums.splice(legalNums.indexOf(val), 1);
                    }
                }
            }

            // Check existing numbers in section
            sectRow = Math.floor(row / 3);
            sectCol = Math.floor(col / 3);
            for (i = 0; i < 9; i++) {
                val = Number(this.matrix.sect[sectRow][sectCol][i]);
                if (val > 0) {
                    // Remove from array
                    if (legalNums.indexOf(val) > -1) {
                        legalNums.splice(legalNums.indexOf(val), 1);
                    }
                }
            }

            if (this.config.solver_shuffle_numbers) {
                // Shuffling the resulting "legalNums" array will
                // make sure the solver produces different answers
                // for the same scenario. Otherwise, "legalNums"
                // will be chosen in sequence.
                for (i = legalNums.length - 1; i > 0; i--) {
                    var rand = getRandomInt(0, i);
                    temp = legalNums[i];
                    legalNums[i] = legalNums[rand];
                    legalNums[rand] = temp;
                }
            }

            return legalNums;
        },
    };

    /**
     * Get a random integer within a range.
     *
     * @param {Number} min Minimum number
     * @param {Number} max Maximum range
     * @returns {Number} Random number within the range (Inclusive)
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max + 1)) + min;
    }

    return {
        /**
         * Get the singleton instance. Only one instance is allowed.
         * The method will either create an instance or will return
         * the already existing instance.
         *
         * @param {[type]} config [description]
         * @returns {[type]} [description]
         */
        getInstance: function(config) {
            if (!_instance) {
                _instance = init(config);
            }
            return _instance;
        }
    };
})(jQuery);
