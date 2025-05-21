document.addEventListener('DOMContentLoaded', function() {
    let currentSquare = 0;
    let isRowHighlighted = true;
    let timerInterval;
    let seconds = 0;
    let isTimerPaused = false;
    let isFilled = new Array(25).fill(false);
    let squaresFilled = 0;
    let rowsFilled = [0, 0, 0, 0, 0];
    let columnsFilled = [0, 0, 0, 0, 0];
    let answer = "FIRMSIDIOMLASSOCHEEKHORSY"

    const squares = document.getElementsByClassName('square')
    let grid = Array.from(squares)

    grid.forEach(function(square, index) {
        square.setAttribute('tabindex', '-1');
        square.addEventListener('click', function() {
            if (currentSquare !== index) {
                grid[currentSquare].classList.remove('focused');
                currentSquare = index;
                focusSquare();
                updatehHighlights();           
            } else {
                switchHighlights();
            }
        });

        square.addEventListener('keydown', function(event) {
            const letter = event.key.toUpperCase();
            if (letter.length === 1 && /^[A-Z]$/.test(letter)) {                
                if (!square.classList.contains('correct')) {
                    square.textContent = letter;
                }
                if (squaresFilled === 25) {
                    checkCorrectness25();
                } else if (!isFilled[currentSquare]) {
                    toggleSquareCounter();
                    //document.getElementById("title").textContent = squaresFilled;
                    if (squaresFilled === 25) {
                        checkCorrectness24();
                    }
                }
                
                if (isRowHighlighted) {
                    nextLetterInRow();
                } else {
                    nextLetterInColumn();
                }
            }

            switch (event.key) {
                case 'ArrowLeft':
                    if (isRowHighlighted) {
                        if (currentSquare % 5 !== 0) {
                            grid[currentSquare].classList.remove('focused');
                            currentSquare -= 1;
                        }
                    }
                    toggleRowHighlight();
                    break;
                case 'ArrowRight':
                    if (isRowHighlighted) {
                        if (currentSquare % 5 !== 4) {
                            grid[currentSquare].classList.remove('focused');
                            currentSquare += 1;
                        }
                    }
                    toggleRowHighlight();
                    break;
                case 'ArrowUp':
                    if (!isRowHighlighted) {
                        if (Math.floor(currentSquare / 5) !== 0) {
                            grid[currentSquare].classList.remove('focused');
                            currentSquare -= 5;
                        }
                    }
                    toggleColumnHighlight();
                    break;
                case 'ArrowDown':
                    if (!isRowHighlighted) {
                        if (Math.floor(currentSquare / 5) !== 4) {
                            grid[currentSquare].classList.remove('focused');
                            currentSquare += 5;
                        }
                    }
                    toggleColumnHighlight();
                    break;
                case 'Enter':
                    enterOrTab(event.shiftKey);
                    break;
                case 'Tab':
                    event.preventDefault();
                    enterOrTab(event.shiftKey);
                    break;
                case ' ':
                    event.preventDefault();
                    switchHighlights();
                    break;
                case 'Backspace':
                    backspace();
                    break;
                case 'Delete':
                    if (isFilled[currentSquare] && !grid[currentSquare].classList.contains('correct')) {
                        clearSquare();
                    }
                    break;
                default:
                    break;
            }
            focusSquare();
            updateComplete();
        });
    });

    focusSquare();
    toggleRowHighlight();

    function toggleRowHighlight() {
        grid.forEach((square) => square.classList.remove('highlight'));
        const rowIndex = Math.floor(currentSquare / 5) * 5;
        for (let i = 0; i < 5; i++) {
            grid[rowIndex + i].classList.add('highlight');
            document.getElementById("a" + (1 + i)).classList.remove('highlight');
            document.getElementById("d" + (1 + i)).classList.remove('highlight');
        }
        let rowId = "a" + (Math.floor(currentSquare / 5) + 1);
        document.getElementById(rowId).classList.add('highlight');
        isRowHighlighted = true;
    }

    function toggleColumnHighlight() {
        grid.forEach((square) => square.classList.remove('highlight'));
        const columnIndex = currentSquare % 5;
        for (let i = columnIndex; i < grid.length; i += 5) {
            grid[i].classList.add('highlight');
            document.getElementById("a" + (Math.floor(i / 5) + 1)).classList.remove('highlight');
            document.getElementById("d" + (Math.floor(i / 5) + 1)).classList.remove('highlight');
        }
        let columnId = "d" + ((currentSquare % 5) + 1);
        document.getElementById(columnId).classList.add('highlight');
        isRowHighlighted = false;
    }

    function switchHighlights() {
        if (isRowHighlighted) {
            toggleColumnHighlight();
        } else {
            toggleRowHighlight();
        }
    }

    function updatehHighlights() {
        if (isRowHighlighted) {
            toggleRowHighlight();
        } else {
            toggleColumnHighlight();
        };
    }

    function focusSquare() {
        grid[currentSquare].classList.add('focused');
        grid[currentSquare].focus();
    }

    function toggleSquareCounter(){
        ++squaresFilled;
        ++rowsFilled[Math.floor(currentSquare/5)];
        ++columnsFilled[currentSquare%5];
        isFilled[currentSquare] = true;
    }

    function nextLetterInRow() {
        if (rowsFilled[Math.floor(currentSquare/5)] === 5) {
            grid[currentSquare].classList.remove('focused');
            currentSquare = Math.min((currentSquare + 1), 5 * Math.floor(currentSquare/5) + 4);
            toggleRowHighlight();
        } else {
            for (let i = 1; i <= 5; i++) {
                if (!isFilled[((currentSquare + i) % 5) + 5 * (Math.floor(currentSquare/5))]) {
                    grid[currentSquare].classList.remove('focused');
                    currentSquare = ((currentSquare + i) % 5) + 5 * (Math.floor(currentSquare/5));
                    toggleRowHighlight();         
                    break;
                }
            }
        }
    }

    function nextLetterInColumn() {
        if (columnsFilled[currentSquare % 5] === 5) {
            grid[currentSquare].classList.remove('focused');
            currentSquare = Math.min(((currentSquare) + 5), currentSquare%5 + 20);
            toggleColumnHighlight();   
        } else {
            for (let i = 1; i <= 5; i++) {                      
                if (!isFilled[((currentSquare) + 5*i) % 25]) {
                    grid[currentSquare].classList.remove('focused');
                    currentSquare = ((currentSquare) + 5*i) % 25;
                    toggleColumnHighlight();                                
                    break;
                }
            }
        }
    }

    function enterOrTab(shiftPressed) {
        if (isRowHighlighted) { //row currently selected
            if (squaresFilled === 25) { //all filled, new currentSquare will be a filled sqaure
                if (shiftPressed) { //go backwards
                    if (currentSquare <= 4) { //toggle to last column
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = 4;
                        toggleColumnHighlight();
                    } else { //toggle to previous row
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = 5 * Math.floor(currentSquare/5) - 5;
                        toggleRowHighlight();
                    }
                } else { //go fowards
                    if (currentSquare >= 20) { //toggle to first column
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = 0;
                        toggleColumnHighlight();
                    } else { //toggle to next row
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = 5 * Math.floor(currentSquare/5) + 5;
                        toggleRowHighlight();
                    }
                }                                
            } else { //not yet filled, new currentSquare will be an unfilled square
                if (shiftPressed) { //go backwards and find first valid square
                    outerloop: for (let i = 1; i <= 10; i++) {                      
                        if ((Math.floor(currentSquare/5) - i + 10) % 10 < 5) { //checking rows
                            if (rowsFilled[Math.floor(currentSquare/5) - i] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[5 * ((Math.floor(currentSquare/5) - i + 10)%10) + j]) {
                                        currentSquare = 5 * ((Math.floor(currentSquare/5) - i + 10)%10) + j;
                                        toggleRowHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        } else { //checking cols
                            if (columnsFilled[(Math.floor(currentSquare/5) - i) % 5] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[(((Math.floor(currentSquare/5) - i + 5))% 5) + 5 * j]) {
                                        currentSquare = (((Math.floor(currentSquare/5) - i + 5))% 5) + 5 * j;
                                        toggleColumnHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        }
                    }
                } else { //go forwards and find first valid square
                    outerloop: for (let i = 1; i <= 10; i++) { //checking rows     
                        if ((Math.floor(currentSquare/5) + i) % 10 < 5) {
                            if (rowsFilled[Math.floor(currentSquare/5) + i] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[5 * (Math.floor(currentSquare/5) + i) + j]) {
                                        currentSquare = 5 * (Math.floor(currentSquare/5) + i) + j;
                                        toggleRowHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        } else { //checking cols
                            if (columnsFilled[(Math.floor(currentSquare/5) + i) % 5] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[(((Math.floor(currentSquare/5) + i))% 5) + 5 * j]) {
                                        currentSquare = (((Math.floor(currentSquare/5) + i))% 5) + 5 * j;
                                        toggleColumnHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else { //same logic as previous but for cols now
            if (squaresFilled === 25) {
                if (shiftPressed) {
                    if (currentSquare % 5 === 0) {
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = 20;
                        toggleRowHighlight();
                    } else {
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = currentSquare%5 - 1;
                        toggleColumnHighlight();
                    }
                } else {
                    if (currentSquare % 5 === 4) {
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = 0;
                        toggleRowHighlight();
                    } else {
                        grid[currentSquare].classList.remove('focused');
                        currentSquare = currentSquare%5 + 1;
                        toggleColumnHighlight();
                    }
                }                                
            } else {
                if (shiftPressed) {
                    outerloop: for (let i = 1; i <= 10; i++) {                      
                        if ((currentSquare % 5 - i + 10) % 10 < 5) {
                            if (columnsFilled[(currentSquare % 5 - i + 10) % 5] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[(currentSquare % 5 - i + 10) % 5 + 5*j]) {
                                        currentSquare = (currentSquare % 5 - i + 10) % 5 + 5*j;
                                        toggleColumnHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        } else {
                            if (rowsFilled[(currentSquare % 5 - i + 10) % 5] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[5 * ((Math.floor(currentSquare%5) - i + 10) % 5) + j]) {
                                        currentSquare = 5 * ((Math.floor(currentSquare%5) - i + 10) % 5) + j;
                                        toggleRowHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    outerloop: for (let i = 1; i <= 10; i++) {                      
                        if ((currentSquare % 5 + i) % 10 < 5) {
                            if (columnsFilled[currentSquare % 5 + i] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[currentSquare % 5 + i + 5*j]) {
                                        currentSquare = currentSquare % 5 + i + 5*j;
                                        toggleColumnHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        } else {
                            if (rowsFilled[currentSquare % 5 + i] != 5) {
                                grid[currentSquare].classList.remove('focused');
                                for (let j = 0; j < 5; j++) {
                                    if (!isFilled[5 * ((Math.floor(currentSquare%5) + i) % 5) + j]) {
                                        currentSquare = 5 * ((Math.floor(currentSquare%5) + i) % 5) + j;
                                        toggleRowHighlight();
                                        break outerloop;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function clearSquare() {
        grid[currentSquare].textContent = '';
        isFilled[currentSquare] = false;
        rowsFilled[Math.floor(currentSquare/5)]--;
        columnsFilled[currentSquare % 5]--;
        squaresFilled--;
    }

    function backspace() {
        if (isRowHighlighted) {
            if (isFilled[currentSquare]) {
                if (grid[currentSquare].classList.contains("correct")) {
                    grid[currentSquare].classList.remove('focused')
                    currentSquare = Math.max(currentSquare - 1, 5 * Math.floor(currentSquare/5));
                } else {
                    clearSquare();
                }
            } else {
                if (currentSquare % 5 != 0) {
                    grid[currentSquare].classList.remove('focused');
                    currentSquare--;
                    if (isFilled[currentSquare] && !grid[currentSquare].classList.contains("correct")) {
                        clearSquare();
                    }
                }
            }
            toggleRowHighlight();                       
        } else { 
            if (isFilled[currentSquare]) {
                if (grid[currentSquare].classList.contains("correct")) {
                    grid[currentSquare].classList.remove('focused')
                    currentSquare = Math.max(currentSquare - 5, currentSquare%5);
                } else {
                    clearSquare();
                }
            } else {
                if (currentSquare > 4) {
                    grid[currentSquare].classList.remove('focused');
                    currentSquare = currentSquare-5;
                    if (isFilled[currentSquare] && !grid[currentSquare].classList.contains("correct")) {
                        clearSquare();
                    }
                }
            }
            toggleColumnHighlight();
        }
    }

    document.getElementById('puzzlereset-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        grid.forEach((square) => square.textContent = '');
        grid.forEach((square) => square.classList.remove("correct"));
        isFilled.fill(false);
        rowsFilled.fill(0);
        columnsFilled.fill(0);
        squaresFilled = 0;
        for (let i = 0; i < 5; i++) {
            document.getElementById("a" + (i + 1)).classList.remove('complete');
            document.getElementById("d" + (i + 1)).classList.remove('complete');
        }
    });

    document.getElementById('puzzletimerreset-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        grid.forEach((square) => square.textContent = '');
        grid.forEach((square) => square.classList.remove("correct"));
        isFilled.fill(false);
        rowsFilled.fill(0);
        columnsFilled.fill(0);
        squaresFilled = 0;
        for (let i = 0; i < 5; i++) {;
            document.getElementById("a" + (i + 1)).classList.remove('complete');
            document.getElementById("d" + (i + 1)).classList.remove('complete');
        }
        seconds = 0;
        isTimerPaused = false;
        document.getElementById('timerDisplay').textContent = '00:00';
        startTimer();
    });

    document.getElementById('squarecheck-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        if (grid[currentSquare].textContent === answer[currentSquare]) {
            grid[currentSquare].classList.add('correct');
        }
    });

    document.getElementById('wordcheck-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        for (let i = 0; i < 5; i++) {
            if (isRowHighlighted) {
                if (grid[5 * Math.floor(currentSquare/5) + i].textContent === answer[5 * Math.floor(currentSquare/5) + i]) {
                    grid[5 * Math.floor(currentSquare/5) + i].classList.add('correct');
                }
            } else {
                if (grid[currentSquare % 5 + 5 * i].textContent === answer[currentSquare % 5 + 5 * i]) {
                    grid[currentSquare % 5 + 5 * i].classList.add('correct');
                }
            }
        }
    });

    document.getElementById('puzzlecheck-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        for (let i = 0; i < 25; i++) {
            if (grid[i].textContent === answer[i]) {
                grid[i].classList.add('correct');
            }
        }
    });
    
    document.getElementById('squarereveal-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        if (!isFilled[currentSquare]) {
            squaresFilled++;
            rowsFilled[Math.floor(currentSquare/5)]++;
            columnsFilled[currentSquare/5]++;
            isFilled[currentSquare] = !isFilled[currentSquare];
            updateComplete();
        }
        grid[currentSquare].textContent = answer[currentSquare];
        grid[currentSquare].classList.add('correct');
    });

    document.getElementById('wordreveal-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        for (let i = 0; i < 5; i++) {
            if (isRowHighlighted) {
                if (!isFilled[5 * Math.floor(currentSquare/5) + i]) {
                    squaresFilled++;
                    rowsFilled[Math.floor(currentSquare/5)]++;
                    columnsFilled[i]++;
                    isFilled[5 * Math.floor(currentSquare/5) + i] = !isFilled[5 * Math.floor(currentSquare/5) + i];
                }
                grid[5 * Math.floor(currentSquare/5) + i].textContent = answer[5 * Math.floor(currentSquare/5) + i];
                grid[5 * Math.floor(currentSquare/5) + i].classList.add('correct');
            } else {
                if (!isFilled[currentSquare % 5 + 5 * i]) {
                    squaresFilled++;
                    rowsFilled[i]++;
                    columnsFilled[currentSquare % 5]++;
                    isFilled[currentSquare % 5 + 5 * i] = !isFilled[currentSquare % 5 + 5 * i];
                }
                grid[currentSquare % 5 + 5 * i].textContent = answer[currentSquare % 5 + 5 * i];
                grid[currentSquare % 5 + 5 * i].classList.add('correct');
            }
        }
        updateComplete();
    });

    document.getElementById('puzzlereveal-btn').addEventListener('click', function() {
        grid[currentSquare].focus();
        grid.forEach((square, index) => square.textContent = answer[index]);
        grid.forEach((square) => square.classList.add('correct'));
        setTimeout(function() {
            alert("you won");
        }, 1);
    });

    document.getElementById('pause').addEventListener('click', function() {
        grid[currentSquare].focus();
        if (isTimerPaused) {
            startTimer();
            isTimerPaused = false;
            this.textContent = 'Pause';
        } else {
            clearInterval(timerInterval);
            isTimerPaused = true;
            this.textContent = 'Resume';
        }
    });

    function updateComplete() {
        for (let i = 0; i < 5; i++) {
            document.getElementById("a" + (i + 1)).classList.remove('complete');
            document.getElementById("d" + (i + 1)).classList.remove('complete');
            if (rowsFilled[i] === 5) {
                document.getElementById("a" + (i + 1)).classList.add('complete');
            }
            if (columnsFilled[i] === 5) {
                document.getElementById("d" + (i + 1)).classList.add('complete');
            }
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(function() {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const secsleft = seconds % 60;
            const time = `${minutes.toString().padStart(2, '0')}:${secsleft.toString().padStart(2, '0')}`; // make sure its 2 digits
            document.getElementById('timerDisplay').textContent = time;
        }, 1000);
    }

    function checkCorrectness24() {
        let allCorrect = true;
        grid.forEach(function(square, index) {
            if (grid[index].textContent != answer[index]) {
                allCorrect = false;
            }
        });
        if (allCorrect) {
            endGame();
        } else {
            notRight();
        }
    }

    function checkCorrectness25() {
        let allCorrect = true;
        grid.forEach(function(square, index) {
            if (grid[index].textContent != answer[index]) {
                allCorrect = false;
            }
        });
        if (allCorrect) {
            endGame();
        }
    }

    document.addEventListener('click', function(event) {
        grid[currentSquare].focus();
        if (document.getElementById('reset-btn').contains(event.target)) {
            document.getElementById("resetdropdown").classList.toggle("show");
        } else {
            document.getElementById("resetdropdown").classList.remove("show");
        }
        if (document.getElementById('check-btn').contains(event.target)) {
            document.getElementById("checkdropdown").classList.toggle("show");
        } else {
            document.getElementById("checkdropdown").classList.remove("show");
        }
        if (document.getElementById('reveal-btn').contains(event.target)) {
            document.getElementById("revealdropdown").classList.toggle("show");
        } else {
            document.getElementById("revealdropdown").classList.remove("show");
        }
    });

    startTimer();

    function endGame() {
        setTimeout(function() {
            alert("you won");
        }, 20);
    }

    function notRight() {
        setTimeout(function() {
            alert("not quite right");
        }, 20);
    }
});