'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Instagram } from 'lucide-react'
import type { SocialPost } from '@/lib/data'

const INSTAGRAM_USER = process.env.NEXT_PUBLIC_INSTAGRAM_USER || 'siimon.psp'

export function InstagramWidget() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [source, setSource] = useState<'api' | 'mock'>('mock')

  useEffect(() => {
    fetch('/api/instagram')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || [])
        setSource(data.source || 'mock')
      })
      .catch(() => {})
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Instagram size={24} className="text-pink-600" />
          <h2 className="section-title">Síguenos en Instagram</h2>
          {source === 'mock' && (
            <span className="badge bg-yellow-100 text-yellow-700 text-[10px] ml-2">Simulado</span>
          )}
        </div>
        <a
          href={`https://instagram.com/${INSTAGRAM_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          @{INSTAGRAM_USER} <ExternalLink size={14} />
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map(post => (
          <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="card overflow-hidden group">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Instagram size={32} className="text-gray-400" />
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-600 line-clamp-2">{post.caption}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(post.postedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </a>
        ))}
      </div>
      {source === 'mock' && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Para conectar Instagram real, configura <code className="bg-gray-100 px-1 rounded">INSTAGRAM_ACCESS_TOKEN</code> y <code className="bg-gray-100 px-1 rounded">INSTAGRAM_USER_ID</code> en el archivo <code className="bg-gray-100 px-1 rounded">.env</code>
        </p>
      )}
    </section>
  )
}
