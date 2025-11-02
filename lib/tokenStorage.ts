// lib/tokenStorage.ts
import fs from 'fs/promises'
import path from 'path'

export interface MeliTokens {
  access_token: string
  refresh_token: string
  expires_in: number   // segundos
  user_id: string
  obtained_at: number  // Date.now() en ms
}

const TOKEN_PATH = path.resolve(process.cwd(), 'meliTokens.json')

export async function getTokens(): Promise<MeliTokens | null> {
  try {
    const data = await fs.readFile(TOKEN_PATH, 'utf-8')
    return JSON.parse(data) as MeliTokens
  } catch {
    return null
  }
}

export async function saveTokens(tokens: MeliTokens) {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), 'utf-8')
}
