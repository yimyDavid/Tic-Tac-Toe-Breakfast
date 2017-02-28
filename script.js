/*
 * Designed and Developed by Yimy Romero
 * minimax algorithm adapted from: https://mostafa-samir.github.io/Tic-Tac-Toe-AI/
 * 
 */

var eggImage = '<img src="https://drive.google.com/uc?id=0BxnDCY9jBpYURThzYlFLOVVoRUk"/>';
var pancakeImage = '<img src="https://drive.google.com/uc?id=0BxnDCY9jBpYUMElSeHVrdXIyVm8"/>';


/*
 * Player object to to assign images values and other player
 * setting
*/

function Player(){
   var imgPath = "";
  this.turn = false;
  this.currentPlayer = false;
  
  this.setImage = function(path){
    imgPath = path;
  }
  
  this.getImage = function(){
    return imgPath;
  }
  
} //end player

var human = new Player();
var pc = new Player();


/*
 * Constructs an action that the ai player could make
 * @param pos [Number]: the cell position the ai would make its action in
 * made that action
 */
var AIAction = function(pos) {

    // public : the position on the board that the action would put the letter on
    this.movePosition = pos;

    //public : the minimax value of the state that the action leads to when applied
    this.minimaxVal = 0;

    /*
     * public : applies the action to a state to get the next state
     * @param state [State]: the state to apply the action to
     * @return [State]: the next state
     */
    this.applyTo = function(state) {
        var next = new State(state);

        //put the letter on the board
        next.board[this.movePosition] = state.turn;

        if(state.turn === "O")
            next.oMovesCount++;

        next.advanceTurn();

        return next;
    }
};

/*
 * public static function that defines a rule for sorting AIActions in ascending manner
 * @param firstAction [AIAction] : the first action in a pairwise sort
 * @param secondAction [AIAction]: the second action in a pairwise sort
 * @return [Number]: -1, 1, or 0
 */
AIAction.ASCENDING = function(firstAction, secondAction) {
    if(firstAction.minimaxVal < secondAction.minimaxVal)
        return -1; //indicates that firstAction goes before secondAction
    else if(firstAction.minimaxVal > secondAction.minimaxVal)
        return 1; //indicates that secondAction goes before firstAction
    else
        return 0; //indicates a tie
}

/*
 * public static function that defines a rule for sorting AIActions in descending manner
 * @param firstAction [AIAction] : the first action in a pairwise sort
 * @param secondAction [AIAction]: the second action in a pairwise sort
 * @return [Number]: -1, 1, or 0
 */
AIAction.DESCENDING = function(firstAction, secondAction) {
    if(firstAction.minimaxVal > secondAction.minimaxVal)
        return -1; //indicates that firstAction goes before secondAction
    else if(firstAction.minimaxVal < secondAction.minimaxVal)
        return 1; //indicates that secondAction goes before firstAction
    else
        return 0; //indicates a tie
}


/*
 * Constructs an AI player with a specific level of intelligence
 * @param level [String]: the desired level of intelligence
 * Modified by Yimy: It only has ONE specific level of inteligence, Master.
 */
var AI = function(level) {

    //private attribute: level of intelligence the player has
    var levelOfIntelligence = level;

    //private attribute: the game the player is playing
    var game = {};

    /*
     * private recursive function that computes the minimax value of a game state
     * @param state [State] : the state to calculate its minimax value
     * @returns [Number]: the minimax value of the state
     */
    function minimaxValue(state) {
        if(state.isTerminal()) {
            //a terminal game state is the base case
            return Game.score(state);
            
        }
        else {
            var stateScore; // this stores the minimax value we'll compute

            if(state.turn === "X")
            // X wants to maximize --> initialize to a value smaller than any possible score
                stateScore = -1000;
            else
            // O wants to minimize --> initialize to a value larger than any possible score
                stateScore = 1000;

            var availablePositions = state.emptyCells();

            //enumerate next available states using the info form available positions
            var availableNextStates = availablePositions.map(function(pos) {
                var action = new AIAction(pos);

                var nextState = action.applyTo(state);

                return nextState;
            });

            /* calculate the minimax value for all available next states
             * and evaluate the current state's value */
            availableNextStates.forEach(function(nextState) {
                var nextScore = minimaxValue(nextState);
                if(state.turn === "X") {
                    // X wants to maximize --> update stateScore iff nextScore is larger
                    if(nextScore > stateScore)
                        stateScore = nextScore;
                }
                else {
                    // O wants to minimize --> update stateScore iff nextScore is smaller
                    if(nextScore < stateScore)
                        stateScore = nextScore;
                }
            });

            return stateScore;
        }
    }

    /*
     * private function: make the ai player take a master move,
     * that is: choose the optimal minimax decision
     * @param turn [String]: the player to play, either X or O
     */
    function takeAMasterMove(turn) {
        var available = game.currentState.emptyCells();

        //enumerate and calculate the score for each avaialable actions to the ai player
        var availableActions = available.map(function(pos) {
            var action =  new AIAction(pos); //create the action object
            var next = action.applyTo(game.currentState); //get next state by applying the action

            action.minimaxVal = minimaxValue(next); //calculate and set the action's minmax value

            return action;
        });

        //sort the enumerated actions list by score
        if(turn === "X")
        //X maximizes --> sort the actions in a descending manner to have the action with maximum minimax at first
            availableActions.sort(AIAction.DESCENDING);
        else
        //O minimizes --> sort the actions in an ascending manner to have the action with minimum minimax at first
            availableActions.sort(AIAction.ASCENDING);


        //take the first action as it's the optimal
        var chosenAction = availableActions[0];
        var next = chosenAction.applyTo(game.currentState);

        ui.insertAt(chosenAction.movePosition, pc.getImage);
        console.log("functiona");
        game.advanceTo(next);
    }


    /*
     * public method to specify the game the ai player will play
     * @param _game [Game] : the game the ai will play
     */
    this.plays = function(_game){
        game = _game;
    };

    /*
     * public function: notify the ai player that it's its turn
     * @param turn [String]: the player to play, either X or O
     */
    this.notify = function(turn) {
      takeAMasterMove(turn);
    };
};


/*
 * object to contain all items accessable to all control functions
 */
var globals = {};


/* picking the image for the human player*/
var pickImage = $(".pick-img");
pickImage.on('click', function(e){
    e.preventDefault();
  
    var selectedDiffeculty = "master";// $('.selected').attr("id");
    if(typeof selectedDiffeculty !== "undefined") {
        var aiPlayer = new AI(selectedDiffeculty);
        globals.game = new Game(aiPlayer);

        aiPlayer.plays(globals.game);

        
    }
    //console.log(e);
    var choices = $(e.target);
    var choicePicked = choices.attr('class');
    console.log(choices.attr('class'));
    if(choices.attr('class') === "egg"){
      human.setImage(eggImage);
      pc.setImage(pancakeImage);
      //console.log(human.getImage());
      

    }else if(choices.attr('class') === "pancake"){
      human.setImage(pancakeImage);
      pc.setImage(eggImage);
      //console.log(human.getImage());
    }
    
    //$(".options").css("margin-left","-300px");
    $(".modal").fadeOut();
    globals.game.start();
  });

/*
 * click on cell (onclick div.cell) behavior and control
 * if an empty cell is clicked when the game is running and its the human player's turn
 * get the indecies of the clickd cell, craete the next game state, upadet the UI, and
 * advance the game to the new created state
 */
 $(".cell").each(function() {
     
     var $this = $(this);
     $this.click(function() {
         if(globals.game.status === "running" && globals.game.currentState.turn === "X" && !$this.hasClass('occupied')) {
             var indx = parseInt($this.data("indx"));

             var next = new State(globals.game.currentState);
             next.board[indx] = "X";

             ui.insertAt(indx, human.getImage);

             next.advanceTurn();

             globals.game.advanceTo(next);

         }
     })
 });

/*
 * Represents a state in the game
 * @param old [State]: old state to intialize the new state
 */
var State = function(old) {

    /*
     * public : the player who has the turn to player
     */
    this.turn = "";

    /*
     * public : the number of moves of the AI player
     */
    this.oMovesCount = 0;

    /*
     * public : the result of the game in this State
     */
    this.result = "still running";

    /*
     * public : the board configuration in this state
     */
    this.board = [];

    /* Begin Object Construction */
    if(typeof old !== "undefined") {
        // if the state is constructed using a copy of another state
        var len = old.board.length;
        this.board = new Array(len);
        for(var itr = 0 ; itr < len ; itr++) {
            this.board[itr] = old.board[itr];
        }

        this.oMovesCount = old.oMovesCount;
        this.result = old.result;
        this.turn = old.turn;
    }
    /* End Object Construction */

    /*
     * public : advances the turn in a the state
     */
    this.advanceTurn = function() {
        this.turn = this.turn === "X" ? "O" : "X";
    }

    /*
     * public function that enumerates the empty cells in state
     * @return [Array]: indices of all empty cells
     */
    this.emptyCells = function() {
        var indxs = [];
        for(var itr = 0; itr < 9 ; itr++) {
            if(this.board[itr] === "E") {
                indxs.push(itr);
            }
        }
        return indxs;
    }

    /*
     * public  function that checks if the state is a terminal state or not
     * the state result is updated to reflect the result of the game
     * @returns [Boolean]: true if it's terminal, false otherwise
     */

    this.isTerminal = function() {
        var B = this.board;

        //check rows
        for(var i = 0; i <= 6; i = i + 3) {
            if(B[i] !== "E" && B[i] === B[i + 1] && B[i + 1] == B[i + 2]) {
                this.result = B[i] + "-won"; //update the state result
                return true;
            }
        }

        //check columns
        for(var i = 0; i <= 2 ; i++) {
            if(B[i] !== "E" && B[i] === B[i + 3] && B[i + 3] === B[i + 6]) {
                this.result = B[i] + "-won"; //update the state result
                return true;
            }
        }

        //check diagonals
        for(var i = 0, j = 4; i <= 2 ; i = i + 2, j = j - 2) {
            if(B[i] !== "E" && B[i] == B[i + j] && B[i + j] === B[i + 2*j]) {
                this.result = B[i] + "-won"; //update the state result
                return true;
            }
        }

        var available = this.emptyCells();
        if(available.length == 0) {
            //the game is draw
            this.result = "draw"; //update the state result
            return true;
        }
        else {
            return false;
        }
    };

};

/*
 * Constructs a game object to be played
 * @param autoPlayer [AIPlayer] : the AI player to be play the game with
 */
var Game = function(autoPlayer) {

    //public : initialize the ai player for this game
    this.ai = autoPlayer;

    // public : initialize the game current state to empty board configuration
    this.currentState = new State();

    //"E" stands for empty board cell
    this.currentState.board = ["E", "E", "E",
                               "E", "E", "E",
                               "E", "E", "E"];

    this.currentState.turn = "X"; //X plays first

    /*
     * initialize game status to beginning
     */
    this.status = "beginning";

    /*
     * public function that advances the game to a new state
     * @param _state [State]: the new state to advance the game to
     */
    this.advanceTo = function(_state) {
        this.currentState = _state;
        if(_state.isTerminal()) {
            this.status = "ended";

            if(_state.result === "X-won")
                //X won
                ui.switchViewTo("won");
            else if(_state.result === "O-won")
                //X lost
                ui.switchViewTo("lost");
            else
                //it's a draw
                ui.switchViewTo("draw");
       
            setTimeout(function(){
            /*
            choose to play again
            */ 
          $(".modal").fadeIn();
          $(".options").css("margin-left","-300px");
            var pickTurn = $(".pick-turn");
                pickTurn.on('click', function(e){
            e.preventDefault();
          
            var choices = $(e.target);
            var choicePicked = choices.text();
      
            if(choicePicked === "YES"){
               ui.clearCells();
               globals = {};
               pickImage.click();

            }else if(choicePicked === "NO"){
              $(".options").css("margin-left","0px");
              $('.modal').fadeIn();
              ui.clearCells();
              globals = {};
          }
      });            /*end choose*/
          },2000);     
        }else {
            //the game is still running
             
            if(this.currentState.turn === "X") {
                ui.switchViewTo("human");
            }
            else {
                ui.switchViewTo("robot");

                //notify the AI player its turn has come up
                this.ai.notify("O");
            }
        }
    };

    /*
     * starts the game
     */
    this.start = function() {
        if(this.status = "beginning") {
            //invoke advanceTo with the initial state
            this.advanceTo(this.currentState);
            this.status = "running";
        }
    }

};

/*
 * public static function that calculates the score of the x player in a given terminal state
 * @param _state [State]: the state in which the score is calculated
 * @return [Number]: the score calculated for the human player
 */
Game.score = function(_state) {
    if(_state.result === "X-won"){
        // the x player won
        return 10 - _state.oMovesCount;
    }
    else if(_state.result === "O-won") {
        //the x player lost
        return - 10 + _state.oMovesCount;
    }
    else {
        //it's a draw
        return 0;
    }
}


/*
 * ui object encloses all UI related methods and attributes
 */
var ui = {};

//holds the state of the intial controls visibility
ui.intialControlsVisible = true;

//holds the setInterval handle for the robot flickering
ui.robotFlickeringHandle = 0;

//holds the current visible view
ui.currentView = "";

/*
 * starts the flickering effect of the robot image
 */
ui.startRobotFlickering = function() {
    ui.robotFlickeringHandle = setInterval(function() {
        $("#robot").toggleClass('robot');
    }, 500);
};

/*
 * stops the flickering effect on the robot image
 */
ui.stopRobotFlickering = function() {
    clearInterval(ui.robotFlickeringHandle);
};

/*
 * switchs the view on the UI depending on who's turn it switchs
 * @param turn [String]: the player to switch the view to
 */
ui.switchViewTo = function(turn) {

    //helper function for async calling
    function _switch(_turn) {
        ui.currentView = "#" + _turn;
        $(ui.currentView).fadeIn("fast");

        if(_turn === "ai")
            ui.startRobotFlickering();
    }

    if(ui.intialControlsVisible) {
        //if the game is just starting
        ui.intialControlsVisible = false;

        $('.intial').fadeOut({
            duration : "slow",
            done : function() {
                _switch(turn);
            }
        });
    }
    else {
        //if the game is in an intermediate state
        $(ui.currentView).fadeOut({
            duration: "fast",
            done: function() {
                _switch(turn);
            }
        });
    }
};

/*
 * places X or O in the specifed place in the board
 * @param i [Number] : row number (0-indexed)
 * @param j [Number] : column number (0-indexed)
 * @param symbol [String]: X or O
 */
ui.insertAt = function(indx, symbol) {
    console.log("hola");
    var board = $('.cell');
    var targetCell = $(board[indx]);

    if(!targetCell.hasClass('occupied')) {
        targetCell.html(symbol);
        targetCell.css({
            color : symbol == "X" ? "green" : "red"
        });
        targetCell.addClass('occupied');
    }
}

ui.clearCells = function(){
  
  var cell = $('.cell');
  console.log(cell);
  $(cell).html("");
  $(cell).removeClass('occupied');
  console.log(cell);

}