const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);
const score = document.getElementById('score');
score.innerText = 0;

function createPiece(type) {
	if (type === 'T') {
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0]
		]
	} else if (type === 'O') {
		return [
			[2, 2],
			[2, 2]
		]
	} else if (type === 'L') {
		return [
			[0, 3, 0],
			[0, 3, 0],
			[0, 3, 3]
		]
	} else if (type === 'J') {
		return [
			[0, 4, 0],
			[0, 4, 0],
			[4, 4, 0]
		]
	} else if (type === 'I') {
		return [
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0]
		]
	} else if (type === 'S') {
		return [
			[0, 6, 6],
			[6, 6, 0],
			[0, 0, 0]
		]
	} else if (type === 'Z') {
		return [
			[7, 7, 0],
			[0, 7, 7],
			[0, 0, 0]
		]
	}
}

const colors = [
	null,
	'red',
	'yellow',
	'blue',
	'green',
	'violet',
	'purple',
	'orange',
	'skyblue'
];

function arenaSweep() {
	outer: for (let y = arena.length - 1; y > 0; y--) {
		for (let x = 0; x < arena[y].length; x++) {
			if (arena[y][x] === 0) {
				continue outer;
			} 
		}

		const row = arena.splice(y, 1)[0].fill(0);
		arena.unshift(row);
		y++;
		player.score += 10;
		score.innerText = player.score;
	}
}

function collide(arena, player) {
	for (let y = 0; y < player.matrix.length; ++y) {
		for (let x = 0; x < player.matrix[y].length; ++x) {
			if (player.matrix[y][x] !== 0 && (arena[y + player.pos.y] && arena[y + player.pos.y][x + player.pos.x]) !== 0) {
				return true;
			}
		}
	}

	return false;
}

function createMatrix(width, height) {
	const matrix = [];
	while(height--) {
		matrix.push(new Array(width).fill(0))
	} 
	return matrix;
}

function draw() {
	context.fillStyle = '#000000';
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawMatrix(arena, { x: 0, y: 0 });
	drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				context.fillStyle = colors[value];
				context.fillRect(x + offset.x, y + offset.y, 1, 1);
			}
		});
	}) ;
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function merge(arena, player) {
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		});
	});
}

function playerDrop() {
	player.pos.y ++;

	if (collide(arena, player)) {
		player.pos.y--;
		merge(arena, player);
		playerReset();
		arenaSweep();
	}

	dropCounter = 0;
}

function playerReset() {
	const pieces = 'TOLJISZ';
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.pos.y = 0;
	player.pos.x = (arena[0].length / 2 | 0) - (player.pos.x / 2 | 0);

	if (collide(arena, player)) {
		alert('Loser!!!!');
		arena.forEach(row => {
			row.fill(0);
		})
	}
}

function playerRotate(dir) {
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, dir);
	while (collide(arena, player)) {
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1: -1));
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix, dir) {
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < y; x ++) {
			[
				matrix[x][y],
				matrix[y][x]
			] = [
				matrix[y][x],
				matrix[x][y]
			];
		}
	}

	if (dir > 0) {
		matrix.forEach((row) => {row.reverse()});
	} else {
		matrix.reverse();
	}
}


function playerMove(dir) {
	player.pos.x += dir;
	if (collide(arena, player)) {
		player.pos.x -= dir;
	}
}



function update(time = 0) {
	if (player.score > 50) {
		dropInterval = 300;
	} else if (player.score > 100) {
		dropInterval = 100;
	}

	const deltaTime = time - lastTime;
	lastTime = time;
	
	dropCounter += deltaTime;
	if (dropCounter > dropInterval) {
		playerDrop();
	}

	draw();
	requestAnimationFrame(update)
}

const arena = createMatrix(12, 20);

const player = {
	pos: { x: 0, y: 0 },
	matrix: null,
	score: 0
}

document.addEventListener('keydown', event => {
	//console.log(event);
	if (event.keyCode === 37) {
		playerMove(-1);
	} else if (event.keyCode === 39) {
		playerMove(1);
	} else if (event.keyCode === 40) {
		playerDrop();
	} else if (event.keyCode === 38) {
		playerRotate(1);
	}
	// } else if (event.keyCode === 87) {
	// 	playerRotate(-1);
	// }

});

playerReset()
update();