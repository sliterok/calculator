const calculator = require('./calc.js')
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', str => {
	const res = calculator(str)
	console.log(res)
});

