const assert = require('assert');

// Расширяемый список токенов
const tokens = {
	'+': {
		prior: 1,
		action: (a, b) => a+b
	},
	'-': {
		prior: 1,
		action: (a, b) => a-b
	},
	'*': {
		prior: 2,
		action: (a, b) => a*b
	},
	'/': {
		prior: 2,
		action: (a, b) => a/b
	},
	'(': {
		prior: 0
	},
	')': {
		prior: 0
	},
}

// Класс исполнителя выражения, которое уже было спаршено
class Executor {
	constructor(){}

	execute (exp) {
		// Количество аргументов выражения
		let n = 0;
		if(exp.a instanceof Expression)
			n++
		if(exp.b instanceof Expression)
			n++

		switch(n) {
			case 2:
				return exp.action(this.execute(exp.a), this.execute(exp.b))
				break;
			case 1:
				// Унарный оператор "-"
				if(exp.token === '-')
					return -this.execute(exp.a)
				break;
			case 0:
				return parseFloat(exp.token)

		}
	}
}

// Класс выражения
class Expression {
	constructor(token, a = null, b = null) {
		this.token = token
		this.a = a
		this.b = b
	}
	get action(){
		return tokens[this.token] ? tokens[this.token].action : null
	}
}

// Класс парсера
class Parser {
	constructor(input){
		this.input = input;
		this.index = 0;
	}
	get char(){
		return this.input[this.index]
	}
	isDigit(str){
		return /[0-9.]/.test(str)
	}
	parseToken(){
		while(this.char === ' '){
			this.index++;
		}

		if(this.isDigit(this.char)){
			let number = ''
			while(this.isDigit(this.char)){
				number += this.char
				this.index++;
			}
			return number;
		}

		if(Object.keys(tokens).includes(this.char)){
			const char = this.char
			this.index += char.length
			return char;
		}

		return '';
	}
	parseUnaryExpression() {
		const token = this.parseToken()
		if(token === '')
			throw new Error('Token search failed')

		if(this.isDigit(token[0]))
			return new Expression(token)

		if(token === '('){
			const res = this.parse()
			if(this.parseToken() !== ')')
				throw new Error('Expected closing bracket')
			return res;
		}

		return new Expression(token, this.parseUnaryExpression())
	}
	parseBinaryExpression(minPrior){
		let left = this.parseUnaryExpression()
		while(true){
			const op = this.parseToken()
			const prior = tokens[op] ? tokens[op].prior : 0
			if(prior <= minPrior){
				this.index -= op.length
				return left;	
			}
			const right = this.parseBinaryExpression(prior)
			left = new Expression(op, left, right)
		}
	}
	parse(){
		return this.parseBinaryExpression(0)
	}
}

const parser = new Parser()
const executor = new Executor()

// Экспортируемая функция калькулятора
function calculator(input){
	const parser = new Parser(input)
	const exp = parser.parse()
	const res = executor.execute(exp)
	return res;
}
module.exports = calculator

function test(){
	[
		['1 + 2 - 3', 0],
		['4 * (3 + 1)', 16],
		['-1 +2 / 2', 0]
	].forEach(el => {
		let val = calculator(el[0]);
		assert(val === el[1], `Test: ${el[0]} = ${el[1]} failed with value: ${val}`)
	})
}
test()