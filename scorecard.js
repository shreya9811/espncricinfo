const request = require('request')
const cheerio = require('cheerio')
const xlsx = require('xlsx')
const fs = require('fs')
const path = require('path')

function makeScorecard (url) {
  request(url, cb)
}
function cb (err, res, html) {
  if (err) {
    console.log(err)
  } else if (res.statusCode === 404) {
    console.log('Page not found')
  } else {
    // console.log(html);
    extractMatchDetails(html)
  }
}

// for a match
// team,
// player,
// opponent , result, runs, bakss, fours, sixes,sr
// venue date result common
function extractMatchDetails (html) {
//   console.log('fffffff')
  const $ = cheerio.load(html)
  const divElement = $('.ds-text-tight-m.ds-font-regular.ds-text-typo-mid3')
  const winnerElement = $('.ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo')
  // Check if the selector matched any element
  // Extract and print the text of the div element
  const divText = divElement.contents().first().text()
  const arr = divText.split(',')
  const venue = arr[1].trim()
  const date = arr[2].trim()
  //   console.log(venue, date)
  //   console.log(divText);

  // Extract and print the text of the div element
  const winText = winnerElement.text()
  //   console.log(winText)

  // segregate innings html
  const innings = $('.ds-w-full.ds-bg-fill-content-prime.ds-overflow-hidden.ds-rounded-xl.ds-border.ds-border-line.ds-mb-4')
  //   console.log(innings);
  for (let i = 0; i < 2; i++) {
    // htmlString = $(innings[i]).html();
    // team op ponent
    const teamname = $(innings[i]).find('.ds-text-title-xs.ds-font-bold.ds-capitalize').text()
    const opponentIndex = (i === 0 ? 1 : 0)
    const opponentname = $(innings[opponentIndex]).find('.ds-text-title-xs.ds-font-bold.ds-capitalize').text()
    console.log(`${venue} ${date} ${teamname} ${opponentname} ${winText}`)
    const cInning = $(innings[i])
    const allRows = cInning.find('.ci-scorecard-table tbody tr')
    for (let j = 0; j < allRows.length; j++) {
      const allCols = $(allRows[j]).find('td') // check whether row is empty or not
      let isWorthy = true
      if (allCols.length < 8) {
        isWorthy = false
      }
      if (isWorthy) {
        const playername = $(allCols[0]).text().trim()
        const runs = $(allCols[2]).text().trim()
        const balls = $(allCols[3]).text().trim()
        const fours = $(allCols[5]).text().trim()
        const sixes = $(allCols[6]).text().trim()
        const sr = $(allCols[7]).text().trim()
        console.log(playername, runs, balls, fours, sixes, sr)
        processPlayer(teamname, playername, runs, balls, fours, sixes, sr, opponentname, venue, date, winText)
      }
    }
  }
}
function processPlayer (teamname, playername, runs, balls, fours, sixes, sr, opponentname, venue, date, winText) {
  const teamPath = path.join(__dirname, 'ipl', teamname)
  dirCreator(teamPath)
  const filePath = path.join(teamPath, playername + '.xlsx')
  const content = excelReader(filePath, playername) // update already existing
  const playerObject = {
    teamname,
    playername,
    runs,
    balls,
    fours,
    sixes,
    opponentname,
    venue,
    date,
    winText
  }
  content.push(playerObject)
  excelWriter(filePath, content, playername)
}
function dirCreator (filePath) { // create ipl folder
  if (fs.existsSync(filePath) === false) {
    fs.mkdirSync(filePath)
  }
}
function excelWriter (filePath, json, sheetName) {
  const newB = xlsx.utils.book_new()
  const newS = xlsx.utils.json_to_sheet(json)
  xlsx.utils.book_append_sheet(newB, newS, sheetName)
  xlsx.writeFile(newB, filePath)
}
function excelReader (filePath, sheetName) {
  if (fs.existsSync(filePath) === false) {
    return []
  }
  const wb = xlsx.readFile(filePath)
  const excelData = wb.Sheets[sheetName]
  const ans = xlsx.utils.sheet_to_json(excelData)
  return ans
}
module.exports = {
  makeScorecard
}
