'use strict';

const util = require('util')
const request = require('request');
const cheerio = require('cheerio');
const tabletojson = require('tabletojson').Tabletojson;

// const url = 'http://www.ddanzi.com/index.php?mid=free&bm=hot';
const options = {
	url: 'https://www.komca.or.kr/srch2/srch_01.jsp',
	method: 'POST',
	form: {
		SYSID: 'PATHFINDER',
		MENUID: '',
		EVENTID: '',
		S_PAGENUMBER: 1,
		S_PROD_CD: '',
		S_RIGHTPRES_GB: 1,
		S_RIGHTPRES_CD: '',
		rows: 10,
		input_idx: '',
		input_name: '',
		input_name2: '',
		pub_val: '',
		S_LIB_YN: 'N',
		S_HANMB_NM: '',
		S_HNAB_GBN: 'I',
		S_SECT_CD: '',
		S_PROD_TTL: '001001118110',
		S_PROD_TTL_GB: 3,
		S_DISCTITLE_NM: '',
		S_SINA_NM: '',
		S_START_DAY: '',
		S_END_DAY: '',
		S_RIGHTPRES_NM: '',
		S_PROD_TTL2: '',
		S_PROD_TTL_GB2: 3,
		S_ROWS: 10,
	}
};

request(options, function (err, res, body) {
	if (err) throw err;

	const $ = cheerio.load(body);
	const resultEl = $('.result_article');
	const items = []

	resultEl.each(function () {
		const worksInfoEl = $(this).find('.works_info')
		const title = worksInfoEl.find('dt').text().trim()
		
		const descriptionEl = worksInfoEl.find('dt+dd > p')
		const description = []
		descriptionEl.each(function () {
			description.push($(this).text().trim())
		})

		// 기획사 등 메타데이터
		const metadataEl = $(this).find('.metadata > p')
		const metadata = []
		metadataEl.each(function () {
			metadata.push($(this).text().trim())
		})
		
		// 3. 권리자 정보
		const rightsholderEl = $(this).find('.board.result')
		const converted = tabletojson.convert(rightsholderEl.html())
		const rightsholders = converted[0]

		rightsholders.forEach(function (obj) {
			const string = obj['저작자명']
			const regexp = /(?<name>.*?)\((?<code>\w+)\)/
			const { name, code } = string.match(regexp).groups

			Object.assign(obj, { name, code })
			delete Object.assign(obj, {['role']: obj['분류'] })['분류'];
			delete Object.assign(obj, {['nameWithCode']: obj['저작자명'] })['저작자명'];
			delete Object.assign(obj, {['publisher']: obj['권리출판사'] })['권리출판사'];
			delete Object.assign(obj, {['alienee']: obj['양수자명'] })['양수자명'];
			delete Object.assign(obj, {['successor']: obj['승계자명'] })['승계자명'];
			delete Object.assign(obj, {['management']: obj['협회관리'] === '관리' })['협회관리'];
		})

		// 정리
		const item = {
			title,
			description,
			metadata,
			rightsholders,
		}
		items.push(item)
	})

	console.log('......... finally', util.inspect(items, false, null, true))
});