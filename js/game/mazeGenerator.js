// Perfect-maze generation (recursive backtracker / randomized DFS): every
// cell is reachable from every other cell by exactly one path, so there's
// always a unique route from start to goal and never an isolated region.
// Pure and seed-driven (via the shared rng, not Math.random()) so a maze is
// fully reproducible and unit-testable without any DOM.
import { shuffle } from '../core/rng.js';

const DIRECTIONS = [
  { name: 'N', dx: 0, dy: -1, opposite: 'S' },
  { name: 'S', dx: 0, dy: 1, opposite: 'N' },
  { name: 'E', dx: 1, dy: 0, opposite: 'W' },
  { name: 'W', dx: -1, dy: 0, opposite: 'E' },
];

function inBounds(width, height, x, y) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * @returns {{width, height, grid, start: {x,y}, goal: {x,y}}} grid[y][x] is
 * {N,S,E,W} booleans — true means a wall blocks that side.
 */
export function generateMaze(width, height, rng) {
  const cells = [];
  for (let y = 0; y < height; y += 1) {
    const row = [];
    for (let x = 0; x < width; x += 1) {
      row.push({ N: true, S: true, E: true, W: true, visited: false });
    }
    cells.push(row);
  }

  // Iterative (not recursive) so an unusually large maze can't blow the call stack.
  const stack = [{ x: 0, y: 0 }];
  cells[0][0].visited = true;
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const candidate = shuffle(rng, DIRECTIONS).find((d) => {
      const nx = current.x + d.dx;
      const ny = current.y + d.dy;
      return inBounds(width, height, nx, ny) && !cells[ny][nx].visited;
    });

    if (!candidate) {
      stack.pop();
      continue;
    }

    const nx = current.x + candidate.dx;
    const ny = current.y + candidate.dy;
    cells[current.y][current.x][candidate.name] = false;
    cells[ny][nx][candidate.opposite] = false;
    cells[ny][nx].visited = true;
    stack.push({ x: nx, y: ny });
  }

  const grid = cells.map((row) => row.map(({ N, S, E, W }) => ({ N, S, E, W })));

  return { width, height, grid, start: { x: 0, y: 0 }, goal: { x: width - 1, y: height - 1 } };
}

/** Whether the cell at (x, y) has an open passage on the given side. */
export function canMove(maze, x, y, direction) {
  if (!inBounds(maze.width, maze.height, x, y)) return false;
  return !maze.grid[y][x][direction];
}

/** The cell reached by moving one step from (x, y) in the given direction — a pure coordinate calculation, no bounds/wall check. */
export function stepTo(x, y, direction) {
  const dir = DIRECTIONS.find((d) => d.name === direction);
  return { x: x + dir.dx, y: y + dir.dy };
}

/**
 * The ordered list of cells from start to goal — in a perfect maze this is
 * the ONLY path between them (no cycles), so anything placed on it, other
 * than the endpoints, is guaranteed to be in the player's way no matter
 * which route they take.
 */
export function solvePath(maze) {
  const key = (c) => `${c.x},${c.y}`;
  const cameFrom = new Map([[key(maze.start), null]]);
  const queue = [maze.start];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.x === maze.goal.x && current.y === maze.goal.y) break;
    for (const dir of DIRECTIONS) {
      if (!canMove(maze, current.x, current.y, dir.name)) continue;
      const next = stepTo(current.x, current.y, dir.name);
      if (!cameFrom.has(key(next))) {
        cameFrom.set(key(next), current);
        queue.push(next);
      }
    }
  }

  const path = [];
  let cursor = maze.goal;
  while (cursor) {
    path.unshift(cursor);
    cursor = cameFrom.get(key(cursor));
  }
  return path;
}
