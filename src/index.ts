import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import inquire from 'inquirer'
import { NL } from '@alexzzz/nl'
import op from 'object-path'
import { license } from './license'
import { getRemoteURL, remote_choices, remote_data_list } from './remote'

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
    validate: (repo_name: string) =>
      isValidPackageName(repo_name) || 'Invalid package.json name',
  },
  {
    type: 'list',
    name: 'remote_type',
    message: 'Which remote git website you want to use?',
    choices: remote_choices,
  },
  {
    type: 'input',
    name: 'remote_type_custom',
    message: 'type your remote git website (no http(s)://)',
    when: (answers: any) => answers.remote_type === 'custom...',
  },
  {
    type: 'list',
    name: 'license_type',
    message: 'which license you want to use?',
    choices: [
      'mit',
      'gpl-3.0',
      'apache-2.0',
    ],
  },
]

const root = process.cwd()
const withRoot = (path: string) => resolve(root, path)

const needsUpdatePkgField = (owner_name: string, repo_name: string, license_name: string, base_remote_url: string) => {
  const base_url = getRemoteURL(base_remote_url)
  return [
    {
      name: 'name',
      value: repo_name,
    },
    {
      name: 'homepage',
      value: `${base_url}${owner_name}/${repo_name}#readme`,
    },
    {
      name: 'bugs.url',
      value: `${base_url}${owner_name}/${repo_name}/issues`,
    },
    {
      name: 'author',
      value: owner_name,
    },
    {
      name: 'repository.url',
      value: `git+${base_url}${owner_name}/${repo_name}.git`,
    },
    {
      name: 'license',
      value: license_name,
    },
  ]
}

async function genPkg(owner_name: string, repo_name: string, license_name: string, base_remote_url: string) {
  logger.info('开始转换 package.json')
  const pkg = readFileSync(withRoot('package.json'), 'utf8')
  const final = { ...JSON.parse(pkg) }
  needsUpdatePkgField(owner_name, repo_name, license_name, base_remote_url).forEach(({ name, value }) => {
    op.set(final, name, value)
  })
  writeFileSync(withRoot('package.json'), JSON.stringify(final, null, 2))
  logger.info('转换 package.json 完成')
}

function genREADME(owner_name: string, repo_name: string) {
  logger.info('开始转换 README.md')
  writeFileSync(withRoot('README.md'), `# ${repo_name} \n\n## License \n\nMIT, ${owner_name}`)
  logger.info('转换 README.md 完成')
}

function genLICENSE(content: string) {
  logger.info('开始转换 LICENSE')
  writeFileSync(withRoot('LICENSE'), content)
  logger.info('转换 LICENSE 完成')
}

async function main() {
  const { owner_name, repo_name, license_type, remote_type, remote_type_custom } = await inquire.prompt(questions)
  // get custom license data
  const { name: license_name, content } = license(license_type, owner_name)
  // get remote data
  const find_remote = remote_data_list.find(({ name }) => name === remote_type)
  const remote_url = find_remote
    ? find_remote.domain
    : remote_type_custom

  // generate package.json
  await genPkg(owner_name, repo_name, license_name, remote_url)

  // generate readme.md
  genREADME(owner_name, repo_name)

  // generate license
  genLICENSE(content)

  // all done
  logger.end('全部工作已经完成')
  process.exit(0)
}

main()

/**
 * copied from `create-vite`
 */
function isValidPackageName(projectName: string) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName,
  )
}
