const puppeteer = require("puppeteer");
const fs = require("fs");

// get link from command line
const url = process.argv[2];

const getBookData = async page => {
	let book = await page.evaluate(() => {
		const grabFromSelector = sel =>
			document.querySelector(`${sel}`).innerText.trim();

		const grabFromSelectorAll = sel => {
			let data = Array.from(document.querySelectorAll(`${sel}`));
			data = data.map(item => ({
				text: item.innerText.trim(),
				url: item.href
			}));
			return data;
		};

		let title = grabFromSelector("h3.title");
		let description = grabFromSelector("div.desc-text-full");
		let author = grabFromSelector("a[itemprop='author']");
		let genres = grabFromSelectorAll("div.info a[itemprop='genre']");
		let links = grabFromSelectorAll("ul.list-chapter a");
		let imageUrl = document.querySelector("div.book img").src;

		let book = {
			title,
			description,
			author,
			genres,
			links,
			imageUrl,
			data: []
		};
		return book;
	});
	return book;
};

const getBookChapters = async (book, page) => {
	// Print book title
	console.log(book.title);

	// Collecting information about each chapter
	for (const link of book.links) {
		await page.goto(`${link.url}`);
		const chapContent = await page.evaluate(() => {
			return document.querySelector("div.chapter-content").innerText.trim();
		});
		book.data.push({
			text: link.text,
			content: chapContent
		});
		console.log(`Done ${link.text}`);
	}

	// refine data once more
	book.genres = book.genres.map(genre => genre.text);
	delete book.links;
	return book;
};

const writeToFile = book => {
	fs.writeFile(
		`./result/${book.title}.json`,
		JSON.stringify(book, null, 2), // optional params to format it nicely
		err =>
			err
				? console.error("Data not written!", err)
				: console.log("Data written!")
	);
};

void (async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);
	let book = null;

	// Collecting raw book data
	book = await getBookData(page);
	book = await getBookChapters(book, page);
	await browser.close();

	// Write data to json file
	writeToFile(book);
	console.log("Scraping data completed!!");
})();
