import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const form = await request.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'pdf file required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'only pdf is supported' }, { status: 400 })
    }

    const safeName = file.name.replace(/[^\w.\-]+/g, '_')
    const blob = await put(`proposal-rfps/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'upload failed' },
      { status: 500 }
    )
  }
}

