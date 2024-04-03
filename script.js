document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.grid');
    const squares = [];
    let focusedIndex;
    let timerInterval;
    let seconds = 0;
    let isMouseDown = false;
    let clickedSquare = null;
    let isRowHighlighted = true; // Flag to track highlighting mode

    window.addEventListener("keydown", function(e) {
        if (e.code === "Enter") {
            e.preventDefault();

            if (isRowHighlighted) {
                // Find the index of the first square in the next row
                const nextRowStart = Math.ceil((focusedIndex + 1) / 5) * 5;
                if (nextRowStart < squares.length) {
                    squares[nextRowStart].focus();
                    focusedIndex = nextRowStart;
                    toggleRowHighlight();
                }
            } else {
                // Find the index of the first square in the next column
                const nextColumnStart = Math.ceil((focusedIndex + 1) / 5) * 5;
                if (nextColumnStart < squares.length) {
                    squares[nextColumnStart].focus();
                    focusedIndex = nextColumnStart;
                    toggleColumnHighlight();
                }
            }
        }
    }, false);

    // Create grid squares
    for (let i = 0; i < 25; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        squares.push(square);
        grid.appendChild(square);

        square.addEventListener('keydown', function(event) {
            const letter = event.key.toUpperCase();
            if (/^[A-Za-z]$/.test(letter)) {
                square.textContent = letter;
            }

            const currentSquareIndex = squares.indexOf(square);
            let nextSquareIndex;

            switch (event.key) {
                case 'ArrowLeft':
                    nextSquareIndex = currentSquareIndex - 1;
                    break;
                case 'ArrowRight':
                    nextSquareIndex = currentSquareIndex + 1;
                    break;
                case 'ArrowUp':
                    nextSquareIndex = currentSquareIndex - 5;
                    break;
                case 'ArrowDown':
                    nextSquareIndex = currentSquareIndex + 5;
                    break;
                default:
                    break;
            }

            const nextSquare = squares[nextSquareIndex];
            if (nextSquare) {
                nextSquare.focus();
                focusedIndex = squares.indexOf(nextSquare); // Update focusedIndex
                squares.forEach(square => square.classList.remove('highlight'));
                if (isRowHighlighted) {
                    toggleRowHighlight();
                } else {
                    toggleColumnHighlight();
                }
            }
        });

        square.setAttribute('tabindex', '0');

        square.addEventListener('mousedown', function(event) {
            event.preventDefault();
            isMouseDown = true;
            clickedSquare = square;
        });

        square.addEventListener('mouseup', function(event) {
            event.preventDefault();
            if (isMouseDown && clickedSquare === square) {
                focusedIndex = squares.indexOf(square);
                let anything = square.classList.contains('focused');
                squares.forEach(square => square.classList.remove('highlight', 'focused'));
                square.classList.add('focused');
                square.focus(); // Ensure the square maintains focus

                // Check if the clicked square is already focused
                if (squares[focusedIndex].classList.contains('focused')) {
                    if (isRowHighlighted && anything) {
                        toggleColumnHighlight();
                        isRowHighlighted = false;
                    } else if (!isRowHighlighted && anything) {
                        toggleRowHighlight();
                        isRowHighlighted = true;
                    } else if (isRowHighlighted) {
                        toggleRowHighlight();
                    } else if (!isRowHighlighted) {
                        toggleColumnHighlight();
                    }
                }
            }
            isMouseDown = false;
        });

        square.addEventListener('blur', function() {
            this.classList.remove('focused');
            squares.forEach(square => square.classList.remove('highlight'));
        });
    }

    function toggleHighlight() {
        toggleRowHighlight();
    }

    function toggleRowHighlight() {
        const rowStart = Math.floor(focusedIndex / 5) * 5; // Index of the first square in the row
        const rowEnd = rowStart + 5; // Index of the last square in the row

        for (let i = 0; i < 25; i++) {
            squares[i].classList.remove('highlight');
        }

        for (let i = rowStart; i < rowEnd; i++) {
            squares[i].classList.add('highlight');
        }

        isRowHighlighted = true;
    }

    function toggleColumnHighlight() {
        const column = focusedIndex % 5;

        for (let i = 0; i < 25; i++) {
            squares[i].classList.remove('highlight');
        }

        for (let i = column; i < 25; i += 5) {
            squares[i].classList.add('highlight');
        }

        isRowHighlighted = false;
    }

    window.addEventListener("keydown", function(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);

    function startTimer() {
        timerInterval = setInterval(function() {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            document.getElementById('timerDisplay').textContent = formattedTime;
        }, 1000);
    }

    startTimer();
});
