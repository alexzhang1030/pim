import remote_data from '../data/remote'

export const remote_choices = remote_data.map(({ name }) => name).concat(['custom...'])
export const remote_data_list = remote_data

export const getRemoteURL = (u: string) => `https://${u}/`
