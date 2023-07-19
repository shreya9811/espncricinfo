const url = 'https://www.espncricinfo.com/series/indian-premier-league-2023-1345038'
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const getAllMatchesLink = require('./allMatch')

const iplPath = path.join(__dirname, 'ipl')
dirCreator(iplPath)
request(url, cb)
function cb (err, res, html) {
  if (err) {
    console.log(err)
  } else if (res.statusCode == 404) {
    console.log('Page not found')
  } else {
    // console.log(html);
    loadHtml(html)
  }
}
function loadHtml (html) {
  const $ = cheerio.load(html) // html parsed
  const divElement = $('div.ds-border-t.ds-border-line.ds-text-center.ds-py-2')

  // Find the anchor tag inside the div element
  const anchorTag = divElement.find('a')

  // Extract the href attribute value of the anchor tag using the attribs property
  const link = anchorTag[0].attribs.href
  console.log(link) // Output: "https://example.com"

  const fullLink = 'https://www.espncricinfo.com/' + link
  // console.log(fullLink);
  getAllMatchesLink.getAllMatchesLink(fullLink)
}

function dirCreator (filePath) { // create ipl folder
  if (fs.existsSync(filePath) === false) {
    fs.mkdirSync(filePath)
  }
}
