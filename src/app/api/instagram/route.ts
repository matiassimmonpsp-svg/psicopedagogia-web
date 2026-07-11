import { NextResponse } from 'next/server'
import { socialPosts as mockPosts } from '@/lib/data'

interface InstagramPost { id: string; caption?: string; media_url?: string; permalink?: string; timestamp?: string }

const INSTAGRAM_USER = process.env.NEXT_PUBLIC_INSTAGRAM_USER || 'sii.mmon'
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || ''
const USER_ID = process.env.INSTAGRAM_USER_ID || ''

export async function GET() {
  if (ACCESS_TOKEN && USER_ID) {
    try {
      const url = `https://graph.instagram.com/v21.0/${USER_ID}/media?fields=id,caption,media_url,permalink,timestamp&access_token=${ACCESS_TOKEN}&limit=12`
      const res = await fetch(url, { next: { revalidate: 3600 } })

      if (!res.ok) {
        throw new Error(`Instagram API error: ${res.status}`)
      }

      const data = await res.json()
      const posts = (data.data || []).map((p: InstagramPost) => ({
        id: parseInt(p.id.replace(/\D/g, '').slice(0, 8), 10) || Math.random(),
        mediaUrl: p.media_url || '',
        caption: p.caption || '',
        permalink: p.permalink || '#',
        postedAt: p.timestamp || new Date().toISOString(),
      }))

      return NextResponse.json({ posts, username: INSTAGRAM_USER, source: 'api' })
    } catch {
      // fallback to mock data
    }
  }

  return NextResponse.json({
    posts: mockPosts,
    username: INSTAGRAM_USER,
    source: 'mock',
  })
}
