const axios = require('axios');
const domParser = require('dom-parser');

var cache = {};
async function crawler(url, id, cb) {
	cache[url] = cache[url] ? cache[url] : await axios.get(url)
		.catch(function (e) {
			console.error("Err near the axios.get", e);
		});
	return cb(cache[url].data, id);
}

function getInnerHTML_example_using_dom_parser(x, id) {
	let r = null;
	try {
		let dp = new domParser({errorHandler: (e) => {
				clog(e);
			}});
		let xmldoc = dp.parseFromString(x, 'text/html');
		let el = xmldoc.getElementById(id);
		r = el.innerHTML;
	} catch (e) {
		console.error(e);
	}	
	return JSON.stringify(r);
}

function getInnerHTML(x, id) {
	let resultAsString = null;
	// Please write your code here
	// Please don't use any standard or nonstandard DOMParser
	
	const idPosition = x.search(`id="${id}"`)
	
	function getIdElementTag(id) {
		const sringBeforeId = x.slice(0, idPosition);
		const stringInTagBeforeId = sringBeforeId.slice(sringBeforeId.lastIndexOf('<') + 1);
		const tag = stringInTagBeforeId.slice(0, stringInTagBeforeId.indexOf(' '));
		return tag
	}

	const tag = getIdElementTag(id);
	const tagOpen = `<${tag}`;
	const tagClose = `</${tag}`;

	function findIndicesOfXInY(item, str) {
		const re = new RegExp(item, 'gi');

		let results = [];
		while (re.exec(str)){
  			results.push(re.lastIndex);
		}
		
		return results
	}

	const stringAfterId = x.slice(idPosition);
	const stringAfterTagOpen = stringAfterId.slice(stringAfterId.indexOf('>') + 1);
	
	const openTags = findIndicesOfXInY(tagOpen, stringAfterTagOpen);
	const closeTags = findIndicesOfXInY(tagClose, stringAfterTagOpen);

	function getResult() {
		let result = '';
		let closeTagsBetween = 0;
		
		for (let i = 1; i <= closeTags.length; i++) {
			const closeTag = closeTags[i - 1];
			closeTagsBetween = i - 1;
			
			let openTagsBetween = 0;
			for (let i = 0; i < openTags.length; i++) {
				if ((openTags[i]) < closeTag) {
					openTagsBetween += 1;
				} else {
					break
				}
			}

			if (closeTagsBetween === openTagsBetween) {
				result = `"${stringAfterTagOpen.slice(0, closeTag - tagClose.length).replace(/\n/g, '\\n').replace(/\"/g, '\\"')}"`;
				break
			}
		}

		return result
	}

	resultAsString = getResult();
	return resultAsString
}

(async () => {
	let url = "https://www.amazon.com/dp/B01I5X5SQE"
	let id = 'SalesRank';
	let r1 = await crawler(url, id, getInnerHTML_example_using_dom_parser);
	let r2 = await crawler(url, id, getInnerHTML_example_using_dom_parser);
	console.log('Does the "getInnerHTML_example_using_dom_parser" function work correctly?', r1 === r2);
	let r3 = await crawler(url, id, getInnerHTML);
	console.log('Does the "getInnerHTML" function work correctly?', r3 === r2);
})()
