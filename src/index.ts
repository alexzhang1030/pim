import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import inquire from 'inquirer'
import { NL } from '@alexzzz/nl'
import op from 'object-path'
import { license } from './license'

const logger = new NL()

const questions = [
  {
    type: 'input',
    name: 'username',
    message: 'What is your github\'s username?',
  },
  {
    type: 'input',
    name: 'repo_name',
    message: 'What is your github\'s repo name?',
  },
]

const root = process.cwd()
const withRoot = (path: string) => resolve(root, path)
const ghPath = 'https://github.com/'

// notice that $$s is replaced with the username
// $$r is replaced with the repo name
const needsUpdatePkgField = [
  {
    name: 'name',
    value: '[$$r]',
  },
  {
    name: 'homepage',
    value: `${ghPath}[$$s]/[$$r]#readme`,
  },
  {
    name: 'bugs.url',
    value: `${ghPath}[$$s]/[$$r]/issues`,
  },
  {
    name: 'author',
    value: '[$$s]',
  },
  {
    name: 'repository.url',
    value: `git+${ghPath}[$$s]/[$$r].git`,
  },
]

async function genPkg(username: string, repo_name: string) {
  logger.info('开始转换 package.json')
  const pkg = readFileSync(withRoot('package.json'), 'utf8')
  const final = { ...JSON.parse(pkg) }
  needsUpdatePkgField.forEach(({ name, value }) => {
    const final_value = value.replace('[$$s]', username).replace('[$$r]', repo_name)
    op.set(final, name, final_value)
  })
  writeFileSync(withRoot('package.json'), JSON.stringify(final, null, 2))
  logger.info('转换 package.json 完成')
}

function genREADME(username: string, repo_name: string) {
  logger.info('开始转换 README.md')
  writeFileSync(withRoot('README.md'), `# ${repo_name} \n\n## License \n\nMIT, ${username}`)
  logger.info('转换 README.md 完成')
}

function genLICENSE(username: string) {
  logger.info('开始转换 LICENSE')
  writeFileSync(withRoot('LICENSE'), license(username))
  logger.info('转换 LICENSE 完成')
}

async function main() {
  const { username, repo_name } = await inquire.prompt(questions)
  await genPkg(username, repo_name)
  genREADME(username, repo_name)
  genLICENSE(username)
  logger.end('全部工作已经完成')
  process.exit(0)
}

main()
