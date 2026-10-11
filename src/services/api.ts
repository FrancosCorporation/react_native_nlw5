import axios from 'axios'

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim()
const baseURL = configuredApiUrl || (__DEV__ ? 'http://localhost:3333' : undefined)

if (!baseURL || !/^https?:\/\//i.test(baseURL)) {
  throw new Error('Configure EXPO_PUBLIC_API_URL com o endereço do backend.')
}

if (!__DEV__ && !baseURL.startsWith('https://')) {
  throw new Error('O backend precisa usar HTTPS fora do ambiente de desenvolvimento.')
}

export const api = axios.create({
  baseURL: baseURL.replace(/\/+$/, ''),
  timeout: 10_000,
})
