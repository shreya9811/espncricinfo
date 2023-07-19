const request = require('request')
const cheerio = require('cheerio')
const makeScorecard = require('./scorecard')

function getAllMatchesLink (url) {
  request(url, function (err, res, html) {
    if (err) {
      console.log(err)
    } else if (res.statusCode === 404) {
      console.log('Page not found')
    } else {
      extractMatchLink(html)
      console.log('lo')
    }
  })
}
function extractMatchLink (html) {
  console.log('here')
  const $ = cheerio.load(html)
  const divElements = $('.ds-grow.ds-px-4.ds-border-r.ds-border-line-default-translucent')
  divElements.each((index, element) => {
    const divElement = $(element)
    const firstAnchorTag = divElement.find('a').first()

    // Extract the href attribute value of the first anchor tag
    const hrefValue = firstAnchorTag.attr('href')
    //   console.log(hrefValue);
    const fullLink = 'https://www.espncricinfo.com/' + hrefValue
    console.log(fullLink)
    makeScorecard.makeScorecard(fullLink)
  })
}

module.exports = {
  getAllMatchesLink
}
