const puppeteer = require("puppeteer");

const url = "https://novels77.com/242810-the-hunger-games.html";

void (async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);

	const novels = await page.evaluate(() => {
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

		let novels = {
			title,
			description,
			author,
			genres,
			links,
			imageUrl,
			data: []
		};
		return novels;
	});
	console.log("Collecting raw data..");
	console.log("Collecting information about each chapter...");

	for (const link of novels.links) {
		await page.goto(`${link.url}`);
		const chapContent = await page.evaluate(() => {
			return document.querySelector("div.chapter-content").innerText.trim();
		});
		console.log(`Done ${link.text}`);

		novels.data.push({
			text: link.text,
			content: chapContent
		});
	}

	console.log("Scraping data completed!");
	console.log(novels);
	await browser.close();
})();
