import mit from '../data/license/mit'
import apache from '../data/license/apache'
import gpl from '../data/license/gpl'

export type VALID_LICENSE = 'mit' | 'gpl-3.0' | 'apache-2.0'

const licenseHelper = (year: number, owner: string, licenseFn: (year: number, owner: string) => string) => licenseFn(year, owner)

const licenses: (year: number, owner: string) => Record<VALID_LICENSE, { name: string; content: string }> =
  (year: number, owner: string) => ({
    "mit": {
      name: "MIT",
      content: licenseHelper(year, owner, mit),
    },
    'gpl-3.0': {
      name: "GPL-3.0",
      content: licenseHelper(year, owner, gpl),
    },
    "apache-2.0": {
      name: "Apache-2.0",
      content: licenseHelper(year, owner, apache)
    }
  })

export function license(license_type: VALID_LICENSE, username: string) {
  const year = new Date().getFullYear()
  return licenses(year, username)[license_type]
}
