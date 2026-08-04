import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Plus,
  Edit,
  TrendingUp,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Fetch market indexes
  const { data: indexes } = await supabase
    .from('market_indexes')
    .select('*, product:products(*), country:countries(*)')
    .order('created_at', { ascending: false })

  const sampleIndexes = [
    { country: 'Spain', product: 'Tuna', avg: '€5.31', low: '€5.10', high: '€5.55', updated: 'July 2026' },
    { country: 'Greece', product: 'Sea Bass', avg: '€5.20', low: '€4.95', high: '€5.60', updated: 'July 2026' },
    { country: 'Norway', product: 'Salmon', avg: '€8.45', low: '€8.10', high: '€8.90', updated: 'July 2026' },
    { country: 'Turkey', product: 'Seabream', avg: '€4.30', low: '€4.00', high: '€4.70', updated: 'July 2026' },
    { country: 'Morocco', product: 'Sardine', avg: '€1.45', low: '€1.20', high: '€1.70', updated: 'July 2026' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Control Panel
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Market Index Management
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Update European commodity price benchmarks, manage verified suppliers, and publish reports.
          </p>
        </div>

        <Button className="bg-[#003399] hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md gap-2 cursor-pointer text-xs">
          <Plus className="h-4 w-4" /> Update Index
        </Button>
      </div>

      {/* Index Table (Matching reference UX) */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Market Index Benchmarks</h2>
          <span className="text-xs text-muted-foreground">Showing 5 active regional indexes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Average Price</th>
                <th className="py-3 px-4">Lowest Price</th>
                <th className="py-3 px-4">Highest Price</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {sampleIndexes.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition">
                  <td className="py-3.5 px-4 font-bold text-foreground">{row.country}</td>
                  <td className="py-3.5 px-4 text-foreground">{row.product}</td>
                  <td className="py-3.5 px-4 font-bold text-primary">{row.avg}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.low}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.high}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.updated}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary cursor-pointer">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
