import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  Bookmark,
  TrendingUp,
  Plus,
  Clock,
  ArrowUpRight,
  UserCheck,
  Building2,
} from 'lucide-react'

export default async function BuyerDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch buyer's requests
  const { data: buyerRequests } = await supabase
    .from('buyer_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch saved suppliers
  const { data: savedSuppliers } = await supabase
    .from('saved_suppliers')
    .select('*, company:companies(*)')
    .eq('buyer_id', user.id)

  const requestsList = buyerRequests || []
  const savedList = savedSuppliers || []
  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Buyer'

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
            <UserCheck className="h-3.5 w-3.5" /> Buyer Account
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-blue-200/80 text-sm mt-1 max-w-lg">
            Manage your seafood buying requests, track saved suppliers, and monitor price trends.
          </p>
        </div>

        <Link href="/requests/new">
          <Button className="bg-[#003399] hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md gap-2 cursor-pointer text-sm">
            <Plus className="h-4 w-4" /> Post Buying Request
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Requests</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{requestsList.length}</div>
          <span className="text-xs text-muted-foreground">Open sourcing tenders</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Suppliers</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{savedList.length}</div>
          <span className="text-xs text-muted-foreground">Favorited supplier profiles</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Markets Tracked</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">15</div>
          <span className="text-xs text-muted-foreground">European trade hubs</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Account Status</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-emerald-600">Verified Buyer</div>
          <span className="text-xs text-muted-foreground">Full access to directory</span>
        </div>
      </div>

      {/* Main Grid: My Requests + Saved Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Requests (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">My Buying Requests</h2>
            <Link href="/requests/new" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Create new <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {requestsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground">No Buying Requests Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Post your first buying request to receive quotes directly from verified seafood suppliers across Europe.
              </p>
              <Link href="/requests/new">
                <Button size="sm" className="bg-primary hover:bg-blue-700 text-white cursor-pointer mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Post Request Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requestsList.map((req) => (
                <div key={req.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between hover:border-primary/40 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{req.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      Quantity: <strong className="text-foreground">{req.quantity} {req.quantity_unit}</strong> • Target Price: <strong className="text-foreground">${req.target_price || 'N/A'}</strong>
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Saved Suppliers (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Saved Suppliers</h2>
            <Link href="/suppliers" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Browse directory <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {savedList.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
              <div className="mx-auto h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Bookmark className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                No saved suppliers yet. Bookmark suppliers from the directory for quick access.
              </p>
              <Link href="/suppliers">
                <Button variant="outline" size="sm" className="w-full cursor-pointer text-xs">
                  Explore Suppliers
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedList.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="font-semibold text-xs text-foreground truncate">
                      {item.company?.name || 'Supplier Company'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Verified Supplier</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
