export function generateMaze(width, height) {
  const cells = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, N: true, S: true, E: true, W: true, visited: false });
    }
    cells.push(row);
  }

  const at = (x, y) => (x >= 0 && x < width && y >= 0 && y < height ? cells[y][x] : null);

  const stack = [];
  let current = at(0, 0);
  current.visited = true;
  let visitedCount = 1;
  const total = width * height;

  const neighbors = (cell) => {
    const dirs = [
      ["N", 0, -1, "S"],
      ["S", 0, 1, "N"],
      ["E", 1, 0, "W"],
      ["W", -1, 0, "E"],
    ];
    const result = [];
    for (const [dir, dx, dy, opp] of dirs) {
      const n = at(cell.x + dx, cell.y + dy);
      if (n && !n.visited) result.push({ cell: n, dir, opp });
    }
    return result;
  };

  while (visitedCount < total) {
    const options = neighbors(current);
    if (options.length > 0) {
      const pick = options[Math.floor(Math.random() * options.length)];
      current[pick.dir] = false;
      pick.cell[pick.opp] = false;
      pick.cell.visited = true;
      visitedCount++;
      stack.push(current);
      current = pick.cell;
    } else {
      current = stack.pop();
    }
  }

  return { width, height, cells };
}
