function doAjax() {
    // object created with input text as attributes
    var board = {
        rows: document.getElementById("rows").value,
        cols: document.getElementById("cols").value,
        mines: document.getElementById("mines").value,
    };

    function validateBoard(){
        // Check if the board is valid
        var keys = Object.values(board);
        for(var key of keys){
            if(isNaN(key) || key > 40){
                console.log(key);
                board.rows = 10;
                board.cols = 10;
                board.mines = 10;
                break;
            } else {
                continue;
            }
        }
    };
    validateBoard();

    //The URL to which we will send the request
    url = 'https://veff213-minesweeper.herokuapp.com/api/v1/minesweeper'

    //Perform an AJAX POST request to the url, and set the param 'myParam' in the request body to paramValue
    axios.post(url, { rows: board.rows, cols: board.cols, mines: board.mines })
        .then(function(response) {processAjax(response);})
        .catch(function (error) {
            //When unsuccessful, print the error.
            console.log(error);
        })
        .then(function () {
            // This code is always executed, independent of whether the request succeeds or fails.
        });
}
function processAjax(response){
    //When successful, print 'Success: ' and the received data
    console.log("Success: ", response.data);
    var container = document.getElementById("game");
    container.classList.remove('avoid-clicks');
    var displayRows = response.data.board.rows;
    var displayCols = response.data.board.cols;
    var placeMines = response.data.board.minePositions;
    var mineCount = response.data.board.mines
    var boardArray = [];
    var mineArray = [];
    var tempIdList = [];
    document.getElementById("game").innerHTML = "";
    console.log("MINES ", placeMines);
    generateBoard()

    function generateBoard(){
        for(var i = 0; i <= displayRows - 1; i++){
            for(var j = 0; j <= displayCols - 1; j++){
                var currentButton = document.createElement("button");
                var id = i + ',' + j;
                currentButton.setAttribute("id", id);
                currentButton.setAttribute('class', 'box');
                currentButton.addEventListener('click', checkClick, false);
                currentButton.addEventListener('contextmenu', checkClick, false)
                container.appendChild(currentButton);
                boardArray.push([i,j]);   
            }
            var newLine = document.createElement("br");
            container.appendChild(newLine);
        }
    }

    function checkClick(e){
        e.preventDefault();
        var currid = e.target.id
        if(event.which === 1){
            processLeftClick(currid);
        }
        if(event.which === 3){
            processRightClick(currid);
        }
    }

    function processRightClick(currid){
        var currElement = document.getElementById(currid);
        if (!currElement.classList.contains('nobomb')){
            if(!currElement.classList.contains('flag') && !currElement.classList.contains('number')){
                currElement.classList.add('flag');
                checkWin(intList, boardArray, placeMines);
            } else {
                currElement.classList.remove('flag');
            }
        }
    }

    function processLeftClick(currid){
        var idList = currid.split(',');
        var intList = idList.map(Number);
        var currElement = document.getElementById(currid);
        if(!currElement.classList.contains('nobomb')){
            if(isBomb(intList)){
                revealBombs(placeMines);
            } else {
                if(!currElement.classList.contains('flag')){
                    revealSquare(intList, currid);
                    checkWin(intList, boardArray, placeMines);
                }
            }
        }
    }

    function isBomb(intList){
        for(var i = 0; i < placeMines.length; i++){
            if(intList[0] === placeMines[i][0] && intList[1] === placeMines[i][1]){
                return true;
            } 
        }
    }

    function getElement(intList){
        return document.getElementById(intList[0] + ',' + intList[1])
    }

    function checkNeighbours(intList){
        var mineCounter = 0;
        var surrElements = [];
        for(var i = intList[0] - 1; i <= intList[0] + 1; i++){
            for(var j = intList[1] - 1; j <= intList[1] + 1; j++){
                var currentElementid = [i, j];
                surrElements.push(currentElementid);
                if(isBomb(currentElementid)){
                    mineCounter = mineCounter + 1;
                } else {
                    continue;
                }
            }
        }
        var curr = getElement(intList);
        if(mineCounter > 0){
            curr.classList.add('number');
            if(mineCounter  === 1){
                curr.classList.add('blue');
            } else if (mineCounter === 2){
                curr.classList.add('green');
            } else {
                curr.classList.add('red');
            }
            curr.innerHTML = mineCounter;
        } else {
            curr.classList.add('nobomb');
            //revealSquare(intList, currid);
        }
    }

    function revealSquare(intList){
        console.log(intList)
        var topL = [intList[0] - 1, intList[1] - 1];
        var top = [intList[0] - 1, intList[1]];
        var topR = [intList[0] - 1, intList[1] + 1];
        var left = [intList[0], intList[1] - 1];
        var right = [intList[0], intList[1] + 1];
        var bottomL = [intList[0] + 1, intList[1] - 1];
        var bottom = [intList[0] + 1, intList[1]];
        var bottomR = [intList[0] + 1, intList[1] + 1];
        checkNeighbours(intList);
        var curr = getElement(intList);
        if (curr.classList.contains('nobomb')){
            if(intList[0] > 0 && intList[1] > 0 && getElement(topL).classList.length === 1)
            revealSquare(topL);
            if(intList[0] > 0 && getElement(top).classList.length === 1)
            revealSquare(top);
            if(intList[0] !== 0 && intList[1] !== displayCols - 1 && getElement(topR).classList.length ===1)
            revealSquare(topR);
            if(intList[1] > 0 && getElement(left).classList.length ===1)
            revealSquare(left);
            if(intList[1] < displayCols - 1 && getElement(right).classList.length === 1)
            revealSquare(right);
            if(intList[0] < displayRows - 1 && intList[1] > 0 && getElement(bottomL).classList.length === 1)
            revealSquare(bottomL);
            if(intList[0] < displayRows - 1 && getElement(bottom).classList.length === 1)
            revealSquare(bottom);
            if(intList[0] < displayRows - 1 && intList[1] < displayCols - 1 && getElement(bottomR).classList.length === 1)
            revealSquare(bottomR);
        }
    }

    function revealBombs(placeMines){
        for(var i = 0; i < placeMines.length; i++){
            var currid = placeMines[i].toString();
            var currElement = document.getElementById(currid);
            currElement.classList.add('bomb');
        }
        setTimeout(function(){ alert("YOU LOST"); }, 1000);
        var gameContainer = document.getElementById('game');
        gameContainer.classList.add('avoid-clicks');
    }

    function checkWin(intList, boardArray, placeMines){
        tempIdList.push(intList);
        flag = true;
        if(tempIdList.length === (boardArray.length - placeMines.length)){
            for(var i = 0; i < placeMines.length; i++){
                var mine = document.getElementById(placeMines[i][0] + ',' + placeMines[i][1])
                if (!mine.classList.contains('flag')){
                    flag = false;
                }
            }
            if(flag){
                setTimeout(function(){ alert("Winner Winner Chicken Dinner"); }, 1000);
                var gameContainer = document.getElementById('game');
                gameContainer.classList.add('avoid-clicks');
            }
        }
    }

}
