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
    name: 'owner_name',
    message: 'What is this project owner(author) name?',
  },
  {
    type: 'input',
    name: 'repo_name',
    message: 'What is this project name?',
  },
]

const root = process.cwd()
const withRoot = (path: string) => resolve(root, path)
const ghPath = 'https://github.com/'

// notice that $$s is replaced with the owner_name
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

async function genPkg(owner_name: string, repo_name: string) {
  logger.info('开始转换 package.json')
  const pkg = readFileSync(withRoot('package.json'), 'utf8')
  const final = { ...JSON.parse(pkg) }
  needsUpdatePkgField.forEach(({ name, value }) => {
    const final_value = value.replace('[$$s]', owner_name).replace('[$$r]', repo_name)
    op.set(final, name, final_value)
  })
  writeFileSync(withRoot('package.json'), JSON.stringify(final, null, 2))
  logger.info('转换 package.json 完成')
}

function genREADME(owner_name: string, repo_name: string) {
  logger.info('开始转换 README.md')
  writeFileSync(withRoot('README.md'), `# ${repo_name} \n\n## License \n\nMIT, ${owner_name}`)
  logger.info('转换 README.md 完成')
}

function genLICENSE(owner_name: string) {
  logger.info('开始转换 LICENSE')
  writeFileSync(withRoot('LICENSE'), license(owner_name))
  logger.info('转换 LICENSE 完成')
}

async function main() {
  const { owner_name, repo_name } = await inquire.prompt(questions)
  await genPkg(owner_name, repo_name)
  genREADME(owner_name, repo_name)
  genLICENSE(owner_name)
  logger.end('全部工作已经完成')
  process.exit(0)
}

main()
