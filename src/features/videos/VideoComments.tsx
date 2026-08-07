import { Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CommentComposer } from '../../components/ui/CommentComposer'
import { marketplaceApi, type VideoComment } from '../../lib/marketplaceApi'

interface VideoCommentsProps {
  authenticated: boolean
  mediaId: string
  onClose: () => void
  onCountChange?: (total: number) => void
  onSignIn: () => void
}

export function VideoComments({ authenticated, mediaId, onClose, onCountChange, onSignIn }: VideoCommentsProps) {
  const [comments, setComments] = useState<VideoComment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyTo, setReplyTo] = useState<VideoComment | null>(null)
  const [posting, setPosting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await marketplaceApi.videoComments(mediaId, { limit: 50 })
      setComments(result.contents)
      setTotal(result.meta.totalItems)
      onCountChange?.(result.meta.totalItems)
    } catch {
      setError('Could not load comments.')
    } finally {
      setLoading(false)
    }
  }, [mediaId, onCountChange])

  useEffect(() => { void load() }, [load])

  async function post(content: string) {
    setPosting(true)
    setError('')
    try {
      await marketplaceApi.postVideoComment(mediaId, {
        content,
        parentId: replyTo?.id,
      })
      setReplyTo(null)
      await load()
    } catch (cause) {
      setError('Your comment could not be posted.')
      // Rethrow so the composer keeps the draft instead of clearing it.
      throw cause
    } finally {
      setPosting(false)
    }
  }

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-[88%] max-w-sm flex-col border-l border-line bg-white text-ink shadow-2xl">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-bold">Comments{total > 0 ? ` · ${total}` : ''}</h2>
        <button aria-label="Close comments" className="grid size-8 place-items-center rounded-full hover:bg-soft" onClick={onClose} type="button">
          <X size={17} />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {loading && (
          <p className="flex items-center gap-2 py-6 text-xs text-muted">
            <Loader2 className="animate-spin" size={14} /> Loading comments…
          </p>
        )}
        {!loading && !comments.length && !error && (
          <p className="py-10 text-center text-xs text-muted">No comments yet. Be the first.</p>
        )}
        {comments.map((comment) => (
          <CommentThread
            authenticated={authenticated}
            comment={comment}
            key={comment.id}
            mediaId={mediaId}
            onReply={setReplyTo}
            onSignIn={onSignIn}
            replyingToId={replyTo?.id ?? null}
          />
        ))}
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      </div>

      <div className="border-t border-line p-4">
        <CommentComposer
          autoFocus={Boolean(replyTo)}
          busy={posting}
          disabled={!authenticated}
          onCancel={replyTo ? () => setReplyTo(null) : undefined}
          onSignIn={onSignIn}
          onSubmit={post}
          placeholder={replyTo ? 'Write a reply…' : 'Add a comment…'}
          replyingTo={replyTo?.author.name}
        />
      </div>
    </aside>
  )
}

function CommentThread({ authenticated, comment, depth = 0, mediaId, onReply, onSignIn, replyingToId }: {
  authenticated: boolean
  comment: VideoComment
  depth?: number
  mediaId: string
  onReply: (comment: VideoComment) => void
  onSignIn: () => void
  replyingToId: string | null
}) {
  const [replies, setReplies] = useState<VideoComment[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggleReplies() {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (replies.length) return
    setLoading(true)
    try {
      const result = await marketplaceApi.videoComments(mediaId, { limit: 50, parentId: comment.id })
      setReplies(result.contents)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={depth ? 'ml-4 border-l border-line pl-3' : ''}>
      <div className="flex gap-3 py-1.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-soft text-[10px] font-bold uppercase">
          {comment.author.name.slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line break-words text-xs leading-5">
            <strong className="mr-2">@{comment.author.name}</strong>{comment.content}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-muted">
            <span>{timeAgo(comment.createdAt)}</span>
            <button
              className={replyingToId === comment.id ? 'text-primary-dark' : 'hover:text-ink'}
              onClick={() => (authenticated ? onReply(comment) : onSignIn())}
              type="button"
            >
              Reply
            </button>
            {comment.replyCount > 0 && (
              <button className="hover:text-ink" onClick={() => void toggleReplies()} type="button">
                {open ? 'Hide' : `View ${comment.replyCount}`} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>
      </div>

      {open && loading && <p className="ml-4 py-1 text-[10px] text-muted">Loading replies…</p>}
      {open && replies.map((reply) => (
        <CommentThread
          authenticated={authenticated}
          comment={reply}
          depth={depth + 1}
          key={reply.id}
          mediaId={mediaId}
          onReply={onReply}
          onSignIn={onSignIn}
          replyingToId={replyingToId}
        />
      ))}
    </div>
  )
}

function timeAgo(value: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
