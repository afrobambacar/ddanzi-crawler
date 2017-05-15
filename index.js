'use strict';

const request = require('request');
const cheerio = require('cheerio');

let url = 'http://www.ddanzi.com/index.php?mid=free&bm=hot';
let options = {
	url: url,
	method: 'GET',
	headers: {
		'User-Agent': 'text/html'
	}
};

request(options, function (err, res, body) {
	if (err) throw err;

	let $ = cheerio.load(body);
	let postElements = $('tbody > tr');

	postElements.each(function () {
		if ($(this).attr('class') !== 'notice') {
			console.log($(this).find('.no').text().trim());
			console.log($(this).find('.title>a').text());
			console.log($(this).find('.title>a').attr('href'));
		}
	});
});