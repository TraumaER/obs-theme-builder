const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')
const argv = require('minimist')(process.argv.slice(2))

const homedir = os.homedir()

const osThemeOutput = {
  'win32': () => `${homedir}/AppData/Roaming/obs-studio/themes/${path.basename(argv.f).replace(/\.qst$/g, '.qss')}`,
  'darwin': () => `${homedir}/Library/Application Support/obs-studio/themes/${path.basename(argv.f).replace(/\.qst$/g, '.qss')}`,
  'linux': () => `${homedir}/.config/obs-studio/themes/${path.basename(argv.f).replace(/\.qst$/g, '.qss')}`,
  
}

let replacers
let output

if (!argv.f) {
  throw new Error('No File provided')
} else {
  if (!/\.qst$/g.test(argv.f)) {
    throw new Error('Wrong filetype provided; Must be *.qst')
  }
  if (!argv.r) {
    try {
      replacers = require('./default.qsv')
    } catch (e) {
      throw new Error('default.qsv replacement file missing and no .qsv file provided')
    }
  } else {
    try {
      replacers = require(`./${argv.r}`)
    } catch (e) {
      throw new Error(`Error opening ${argv.r} replacer file`)
    }
  }
  
  
  const platform = os.platform()

  output = osThemeOutput[platform]()
}

async function processTemplateFile () {
  const fileStream = fs.createReadStream(argv.f)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })
  let lines = []
  for await (const line of rl) {
    let cleanline = line
    Object.keys(replacers).forEach(key => {
      cleanline = cleanline.replace(`@${key}`, replacers[key])
    })
    lines.push(cleanline)
  }

  fs.mkdirSync(path.dirname(output), {recursive: true})

  fs.writeFileSync(output, '', { encoding: 'utf8' })
  lines.forEach(line => {
    fs.appendFileSync(output, `${line}\n`, { encoding: 'utf8' })
  })
}

processTemplateFile()
