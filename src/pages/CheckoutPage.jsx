import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BadgeCheck, CreditCard, Landmark, Loader2, Lock, QrCode, ShieldCheck, Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getProgramme, DOMAIN_COLORS } from '../data/programmes.js'
import { batchPrice } from '../data/plans.js'
import { api, waitForPaidOrder } from '../lib/api.js'
import { Button } from '../components/ui/Button.jsx'
import { DomainIcon } from '../components/ui/Icon.jsx'
import { cn } from '../lib/utils.js'

const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'GPay · PhonePe · Paytm', Icon: Landmark },
  { id: 'card', label: 'Card', hint: 'Credit / debit card', Icon: CreditCard },
  { id: 'qr', label: 'QR', hint: 'Scan & pay', Icon: QrCode },
]

let razorpayPromise = null
function loadRazorpay() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        razorpayPromise = null
        reject(new Error('Could not load the Razorpay checkout library.'))
      }
      document.head.appendChild(script)
    })
  }
  return razorpayPromise
}

export default function CheckoutPage() {
  const { candidate, bookingDraft, setBookingDraft, saveBooking, refreshMe } = useApp()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const domain = params.get('d') || bookingDraft?.domain
  const duration = Number(params.get('dur')) || bookingDraft?.duration
  const draftForm = bookingDraft?.form || {}

  const [method, setMethod] = useState('upi')
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)
  const [useWallet, setUseWallet] = useState(false)

  const p = getProgramme(domain)
  const price = batchPrice(duration)
  const walletBalance = candidate?.wallet?.balance || 0
  const walletApplied = useWallet ? Math.min(walletBalance, price.total) : 0
  const payable = Math.max(0, price.total - walletApplied)

  if (!candidate) return null
  if (!p || !duration || !bookingDraft) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-5 text-center">
        <div>
          <p className="font-display text-2xl font-bold text-ink dark:text-paper">Nothing to check out yet</p>
          <p className="mt-2 text-sm text-ink/55 dark:text-paper/55">Pick a track and a batch duration from your dashboard first.</p>
          <Button className="mt-6" onClick={() => navigate('/dashboard')}><ArrowLeft size={15} /> Back to dashboard</Button>
        </div>
      </div>
    )
  }

  const cancelOrder = (id) => {
    if (!id) return
    api.post(`/booking/${id}/cancel`).catch(() => {})
  }

  const finalize = async (id) => {
    // Pull the settled candidate + wallet from the server.
    const fresh = await refreshMe()
    const payment = fresh?.booking?.payment || {}
    saveBooking(domain, duration, {
      name: draftForm.name || candidate.name,
      email: draftForm.email || candidate.email,
      phone: draftForm.phone || '',
      college: draftForm.college || '',
      start: draftForm.start || '',
      payment: {
        method: payment.method || 'mock',
        amount: payment.amount ?? payable,
        txId: payment.txId || id,
        orderId: id,
        at: payment.at || new Date().toISOString(),
      },
    })
    setPaying(false)
    setDone(true)
    setBookingDraft(null)
    push(`Payment successful — ${p.title} seat locked`, 'success')
  }

  const pay = async () => {
    if (paying) return
    setPaying(true)
    let id = null
    try {
      // 1. create the order — the server atomically holds the seat and
      //    answers with the gateway mode (razorpay | mock) it will use.
      const created = await api.post('/booking/order', { domain, duration })
      id = created?.order?.id
      if (!id) throw new Error('The server did not return an order.')

      if (created?.order?.mode === 'razorpay') {
        // 2a. live Razorpay: open the hosted checkout, verify the gateway
        // signature via /booking/:orderId/verify, then wait for the settled order.
        const key = import.meta.env.VITE_RAZORPAY_KEY
        if (!key) throw new Error('Razorpay checkout is not configured on this frontend (VITE_RAZORPAY_KEY).')
        await loadRazorpay()
        const rzp = new window.Razorpay({
          key,
          order_id: id,
          name: 'Codetern',
          description: `${p.title} · ${duration}-month batch`,
          currency: 'INR',
          handler: async (res) => {
            setPaying(true)
            try {
              await api.post(`/booking/${id}/verify`, {
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
              })
              await waitForPaidOrder(id)
              await finalize(id)
            } catch (err) {
              cancelOrder(id)
              setPaying(false)
              push(err.message, 'error')
            }
          },
          modal: {
            ondismiss: () => {
              cancelOrder(id)
              setPaying(false)
              push('Payment cancelled — your hold was released.', 'info')
            },
          },
        })
        rzp.open()
      } else {
        // 2b. mock mode (dev server): settle the hold-order, then wait for the
        // paid status to land in the DB.
        await api.post('/booking/pay-mock', { orderId: id })
        await waitForPaidOrder(id)
        await finalize(id)
      }
    } catch (err) {
      cancelOrder(id)
      setPaying(false)
      push(err.message || 'Payment failed — please try again.', 'error')
    }
  }

  const color = DOMAIN_COLORS[p.color]

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <header className="border-b border-ink/8 bg-paper/80 backdrop-blur-md dark:border-white/10 dark:bg-ink/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-ink dark:text-paper/60 dark:hover:text-paper">
            <ArrowLeft size={16} /> Back to dashboard
          </button>
          <span className="flex items-center gap-2 text-sm font-bold text-ink dark:text-paper">
            <Lock size={14} className="text-mint-deep dark:text-mint" /> Secure checkout
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-[1fr_380px]">
        {/* left: payment methods / success */}
        <div data-enter>
          {done ? (
            <div className="flex flex-col items-center rounded-panel border border-mint-deep/30 bg-white p-10 text-center shadow-card dark:border-mint/30 dark:bg-ink-soft dark:shadow-none">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint">
                <BadgeCheck size={38} />
              </span>
              <h1 className="mt-6 font-display text-3xl font-bold text-ink dark:text-paper">Seat locked — payment received</h1>
              <p className="mt-2 max-w-md text-sm text-ink/55 dark:text-paper/55">
                Your receipt <span className="font-mono font-bold text-ink dark:text-paper">#{candidate.booking?.payment?.txId || 'TXN…'}</span> is saved to your profile.
                Next up: complete your profile & resume to unlock the live workspace.
              </p>
              <Button size="lg" variant="accent" className="mt-8" onClick={() => navigate('/dashboard')}>
                Go to my dashboard <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-paper">Complete your payment</h1>
              <p className="mt-1.5 text-sm text-ink/55 dark:text-paper/55">Demo checkout — no real money moves. Pick a method and pay.</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {METHODS.map((m) => {
                  const Icon = m.Icon
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                        method === m.id ? 'border-cyan-snap/60 bg-cyan-snap/8 ring-4 ring-cyan-snap/10' : 'border-ink/10 bg-white hover:border-cyan-deep/40 dark:border-paper/10 dark:bg-ink-soft dark:hover:border-cyan-snap/40',
                      )}
                    >
                      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', method === m.id ? 'bg-ink text-neon dark:bg-paper dark:text-ink' : 'bg-ink/5 text-ink/50 dark:bg-paper/5 dark:text-paper/50')}>
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-ink dark:text-paper">{m.label}</span>
                        <span className="block text-[11px] text-ink/45 dark:text-paper/45">{m.hint}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 rounded-panel border border-ink/10 bg-white p-6 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                {method === 'upi' && (
                  <div className="grid gap-3">
                    <p className="text-sm font-semibold text-ink dark:text-paper">Pay via UPI</p>
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-paper/60 px-4 py-3 dark:border-paper/20 dark:bg-ink">
                      <Landmark size={16} className="text-cyan-deep dark:text-cyan-snap" />
                      <code className="font-mono text-sm font-bold text-ink dark:text-paper">codetern@okaxis</code>
                    </div>
                    <p className="text-xs text-ink/45 dark:text-paper/45">Open GPay / PhonePe / Paytm and pay the UPI ID above, then confirm below.</p>
                  </div>
                )}
                {method === 'card' && (
                  <div className="grid gap-3">
                    <p className="text-sm font-semibold text-ink dark:text-paper">Card details</p>
                    <input placeholder="Card number · 1234 5678 9012 3456" className="cdt-input w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-snap/60" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM / YY" className="cdt-input w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-snap/60" />
                      <input placeholder="CVV" className="cdt-input w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-snap/60" />
                    </div>
                  </div>
                )}
                {method === 'qr' && (
                  <div className="flex flex-col items-center gap-3">
                    <p className="self-start text-sm font-semibold text-ink dark:text-paper">Scan & pay</p>
                    <div className="grid place-items-center rounded-2xl border border-ink/10 bg-white p-4 dark:border-paper/10">
                      <svg width="168" height="168" viewBox="0 0 21 21" className="text-ink">
                        {Array.from({ length: 21 }).map((_, r) =>
                          Array.from({ length: 21 }).map((_, c) => {
                            const on =
                              (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)
                                ? (r % 7 < 4 && c % 7 < 4)
                                : ((r * 31 + c * 17) % 5 === 0) || ((r * 13 + c * 29) % 7 === 0)
                            return <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={on ? 'currentColor' : 'transparent'} />
                          }),
                        )}
                      </svg>
                    </div>
                    <p className="text-xs text-ink/45 dark:text-paper/45">Scan with any UPI app — payment is simulated.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* right: order summary */}
        {!done && (
          <aside className="self-start rounded-panel border border-ink/10 bg-white p-6 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none" data-enter>
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45 dark:text-paper/45">Order summary</p>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper/60 p-3.5 dark:border-paper/10 dark:bg-ink">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: color.bg, color: 'var(--color-ink)' }}>
                <DomainIcon name={p.icon} size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink dark:text-paper">{p.title}</p>
                <p className="text-[11px] text-ink/50 dark:text-paper/50">{duration} month{duration > 1 ? 's' : ''} batch</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-ink/55 dark:text-paper/55">Launch marker (struck off)</span>
                <span className="font-semibold text-ink/45 line-through dark:text-paper/45">₹{price.original}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink/55 dark:text-paper/55">Whole-batch fee</span>
                <span className="font-semibold text-ink dark:text-paper">₹{price.total}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink/55 dark:text-paper/55">Today&apos;s saving</span>
                <span className="font-semibold text-mint-deep dark:text-mint">−₹{price.saved}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-ink/8 pt-2.5 dark:border-paper/10">
                <span className="text-ink/55 dark:text-paper/55">Wallet balance</span>
                <button onClick={() => setUseWallet((v) => !v)} className={cn('flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition', useWallet ? 'border-mint-deep/50 bg-mint-deep/10 text-mint-deep dark:border-mint/50 dark:bg-mint/10 dark:text-mint' : 'border-ink/15 text-ink/60 dark:border-paper/20 dark:text-paper/60')}>
                  <Wallet size={12} /> ₹{walletBalance} {useWallet ? '· applied' : '· apply'}
                </button>
              </div>
              {walletApplied > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-ink/55 dark:text-paper/55">Wallet applied</span>
                  <span className="font-semibold text-mint-deep dark:text-mint">−₹{walletApplied}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-end justify-between rounded-2xl bg-ink px-4 py-3.5 text-white dark:bg-ink">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Total payable</span>
              <span className="font-display text-2xl font-extrabold text-neon">₹{payable}</span>
            </div>

            <Button size="lg" variant="neon" className="mt-5 w-full" onClick={pay} disabled={paying}>
              {paying ? <Loader2 size={17} className="animate-spin" /> : <Lock size={16} />}
              {paying ? 'Processing payment…' : `Pay ₹${payable} & lock seat`}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink/40 dark:text-paper/40">
              <ShieldCheck size={12} className="text-mint-deep dark:text-mint" />
              100% simulated payment · free retake included · cancel anytime
            </p>
          </aside>
        )}
      </main>
    </div>
  )
}
