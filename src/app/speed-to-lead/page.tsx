'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QUALIFYING_QUESTIONS, REPLY_TARGET_SECONDS, type Trade, type ReplyLanguage } from '@/lib/speed-to-lead'

const replyChannels = [
  { id: 'sms', name: 'SMS', bubbleLabel: 'SMS to your customer' },
  { id: 'wechat', name: 'WeChat (微信)', bubbleLabel: 'WeChat message to your customer' },
] as const
type DemoChannel = (typeof replyChannels)[number]['id']

const trades: { id: Trade; name: string }[] = [
  { id: 'mowing', name: 'Mowing & lawns' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'tree', name: 'Tree work' },
  { id: 'gardening', name: 'Gardening' },
  { id: 'general', name: 'Other service' },
]

export default function SpeedToLeadPage() {
  const [business, setBusiness] = useState('')
  const [trade, setTrade] = useState<Trade>('mowing')
  const [missedCall, setMissedCall] = useState(true)
  const [channel, setChannel] = useState<DemoChannel>('sms')
  const [language, setLanguage] = useState<ReplyLanguage>('en')
  const chooseChannel = (c: DemoChannel) => {
    setChannel(c)
    setLanguage(c === 'wechat' ? 'zh' : 'en') // sensible default; either language works on either channel
    setReply('')
  }
  const channelInfo = replyChannels.find(c => c.id === channel)!
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const preview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setReply('')
    setLoading(true)
    try {
      const res = await fetch('/api/leads/reply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          business, trade, channel, language, missedCall,
          source: channel === 'wechat' ? 'wechat_account' : 'tracked_number',
        }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Something went wrong')
      else setReply(data.reply)
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <p className="text-5xl mb-3">⚡</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Never Lose a Job to a Missed Call</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          You&apos;re up a ladder or behind a mower. We reply to every enquiry and missed call within {REPLY_TARGET_SECONDS} seconds,
          ask the questions you need to quote, and hand the customer to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <form onSubmit={preview} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">See the reply your customers get</h2>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Business name</span>
            <input value={business} onChange={(e) => setBusiness(e.target.value)} required maxLength={100}
              placeholder="e.g. Fitzroy Mowing"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Your trade</span>
            <select value={trade} onChange={(e) => setTrade(e.target.value as Trade)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
              {trades.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Reply by</span>
              <select value={channel} onChange={(e) => chooseChannel(e.target.value as DemoChannel)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                {replyChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Reply language</span>
              <select value={language} onChange={(e) => { setLanguage(e.target.value as ReplyLanguage); setReply('') }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="en">English</option>
                <option value="zh">中文 (Simplified Chinese)</option>
              </select>
            </label>
          </div>
          <label className="flex items-center text-sm text-gray-700">
            <input type="checkbox" checked={missedCall} onChange={(e) => setMissedCall(e.target.checked)}
              className="rounded border-gray-300 text-linkedin mr-2" />
            The customer called and I missed it
          </label>
          <button type="submit" disabled={loading}
            className="w-full bg-linkedin text-white py-3 rounded-lg font-semibold hover:bg-linkedin-dark transition-colors disabled:opacity-50">
            {loading ? 'Writing reply…' : 'Preview the reply'}
          </button>
          <p className="text-xs text-gray-500">
            Questions for this trade: {QUALIFYING_QUESTIONS[trade].length}. Every SMS and WeChat reply says it&apos;s automated and includes an opt-out.
          </p>
        </form>

        <div className="space-y-4">
          <div className="bg-gray-100 rounded-2xl p-4 min-h-[16rem]" aria-live="polite">
            <p className="text-xs text-gray-500 mb-2">{channelInfo.bubbleLabel}</p>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {reply ? (
              <p data-testid="reply" className="bg-green-500 text-white rounded-2xl rounded-tl-sm p-3 text-sm whitespace-pre-line max-w-sm">{reply}</p>
            ) : (
              !error && <p className="text-sm text-gray-400">Enter your business name and press Preview.</p>
            )}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm">
            <p className="font-semibold text-green-900 mb-1">Included from Grace ($149/mo)</p>
            <p className="text-green-800 mb-3">
              Works for leads from your own number, form and WeChat account, and from hipages, Airtasker, Bark and franchise head office.
              Tiny businesses on pay per lead get it too, and platform leads are never charged per lead.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/booking?service=11" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Set It Up</Link>
              <Link href="/pricing#payg" className="text-green-800 underline py-2">Pay per lead</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
