document.addEventListener("DOMContentLoaded", () => {
    const rows = 5;
    const cols = 5;
    const container = document.querySelector(".grid");

    // turns container into a 5×5 CSS grid:
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    container.style.gap = "2px";

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.classList.add("row" + r);
        square.classList.add("col" + c);
        container.appendChild(square);
      }
    }
  });