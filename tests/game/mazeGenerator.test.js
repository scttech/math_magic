import { createRng } from '../../js/core/rng.js';
import { generateMaze, canMove, stepTo, solvePath } from '../../js/game/mazeGenerator.js';

function reachableCount(maze) {
  const seen = new Set([`${maze.start.x},${maze.start.y}`]);
  const stack = [maze.start];
  while (stack.length > 0) {
    const { x, y } = stack.pop();
    for (const dir of ['N', 'S', 'E', 'W']) {
      if (!canMove(maze, x, y, dir)) continue;
      const next = stepTo(x, y, dir);
      const key = `${next.x},${next.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        stack.push(next);
      }
    }
  }
  return seen.size;
}

QUnit.module('game/mazeGenerator', () => {
  QUnit.test('every cell is reachable from the start (a perfect maze has no isolated regions)', (assert) => {
    for (const [width, height] of [[6, 6], [8, 8], [10, 10], [4, 9]]) {
      const maze = generateMaze(width, height, createRng(42));
      assert.equal(reachableCount(maze), width * height, `all ${width * height} cells reachable for a ${width}x${height} maze`);
    }
  });

  QUnit.test('start is the top-left corner and goal is the bottom-right corner', (assert) => {
    const maze = generateMaze(7, 5, createRng(1));
    assert.deepEqual(maze.start, { x: 0, y: 0 });
    assert.deepEqual(maze.goal, { x: 6, y: 4 });
  });

  QUnit.test('the same seed produces the exact same maze every time', (assert) => {
    const a = generateMaze(8, 8, createRng(12345));
    const b = generateMaze(8, 8, createRng(12345));
    assert.deepEqual(a, b);
  });

  QUnit.test('different seeds produce different mazes', (assert) => {
    const a = generateMaze(8, 8, createRng(1));
    const b = generateMaze(8, 8, createRng(2));
    assert.notDeepEqual(a.grid, b.grid);
  });

  QUnit.test('outer boundary cells always have a wall on the boundary side', (assert) => {
    const maze = generateMaze(5, 4, createRng(7));
    for (let y = 0; y < maze.height; y += 1) {
      assert.ok(maze.grid[y][0].W, `left column cell (0,${y}) has a west wall`);
      assert.ok(maze.grid[y][maze.width - 1].E, `right column cell (${maze.width - 1},${y}) has an east wall`);
    }
    for (let x = 0; x < maze.width; x += 1) {
      assert.ok(maze.grid[0][x].N, `top row cell (${x},0) has a north wall`);
      assert.ok(maze.grid[maze.height - 1][x].S, `bottom row cell (${x},${maze.height - 1}) has a south wall`);
    }
  });

  QUnit.test('a perfect maze has exactly width*height - 1 open passages (a spanning tree)', (assert) => {
    const width = 6;
    const height = 6;
    const maze = generateMaze(width, height, createRng(99));
    let openSides = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (canMove(maze, x, y, 'E')) openSides += 1;
        if (canMove(maze, x, y, 'S')) openSides += 1;
      }
    }
    assert.equal(openSides, width * height - 1);
  });

  QUnit.test('canMove is symmetric: an open side on one cell is open from the neighbor too', (assert) => {
    const maze = generateMaze(6, 6, createRng(3));
    for (let y = 0; y < maze.height; y += 1) {
      for (let x = 0; x < maze.width; x += 1) {
        if (canMove(maze, x, y, 'E')) {
          const next = stepTo(x, y, 'E');
          assert.ok(canMove(maze, next.x, next.y, 'W'), `(${next.x},${next.y}) can move W back to (${x},${y})`);
        }
      }
    }
  });

  QUnit.test('canMove is false off the edge of the grid', (assert) => {
    const maze = generateMaze(3, 3, createRng(5));
    assert.notOk(canMove(maze, 0, 0, 'N'));
    assert.notOk(canMove(maze, 0, 0, 'W'));
    assert.notOk(canMove(maze, 2, 2, 'S'));
    assert.notOk(canMove(maze, 2, 2, 'E'));
  });

  QUnit.test('stepTo computes the destination coordinate for each direction', (assert) => {
    assert.deepEqual(stepTo(2, 2, 'N'), { x: 2, y: 1 });
    assert.deepEqual(stepTo(2, 2, 'S'), { x: 2, y: 3 });
    assert.deepEqual(stepTo(2, 2, 'E'), { x: 3, y: 2 });
    assert.deepEqual(stepTo(2, 2, 'W'), { x: 1, y: 2 });
  });

  QUnit.test('solvePath returns a connected route from start to goal', (assert) => {
    const maze = generateMaze(8, 7, createRng(11));
    const path = solvePath(maze);
    assert.deepEqual(path[0], maze.start);
    assert.deepEqual(path[path.length - 1], maze.goal);
    for (let i = 1; i < path.length; i += 1) {
      const prev = path[i - 1];
      const cur = path[i];
      const dir = ['N', 'S', 'E', 'W'].find((d) => {
        const next = stepTo(prev.x, prev.y, d);
        return next.x === cur.x && next.y === cur.y;
      });
      assert.ok(dir && canMove(maze, prev.x, prev.y, dir), `step ${i} from (${prev.x},${prev.y}) to (${cur.x},${cur.y}) is an open passage`);
    }
  });

  QUnit.test('solvePath never revisits a cell (it is the single simple path through a perfect maze)', (assert) => {
    const maze = generateMaze(9, 6, createRng(22));
    const path = solvePath(maze);
    const seen = new Set(path.map((c) => `${c.x},${c.y}`));
    assert.equal(seen.size, path.length);
  });

  QUnit.test('solvePath on a 1x1 maze is just the single start/goal cell', (assert) => {
    const maze = generateMaze(1, 1, createRng(1));
    assert.deepEqual(solvePath(maze), [{ x: 0, y: 0 }]);
  });

  QUnit.test('a 1x1 maze is trivially just the start/goal cell with every side walled', (assert) => {
    const maze = generateMaze(1, 1, createRng(1));
    assert.deepEqual(maze.start, { x: 0, y: 0 });
    assert.deepEqual(maze.goal, { x: 0, y: 0 });
    assert.deepEqual(maze.grid[0][0], { N: true, S: true, E: true, W: true });
  });
});
