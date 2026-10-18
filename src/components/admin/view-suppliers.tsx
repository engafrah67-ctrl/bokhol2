'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  Search,
  Plus,
  ExternalLink,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Fish,
  Package,
  CheckCircle2,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'

interface ViewSuppliersProps {
  suppliers: any[]
  loading: boolean
  postsCountMap: Record<string, number>
  onAddProduct: (supplier: any) => void
  onManageProducts: (supplier: any) => void
  onDeleteSupplier: (id: string, name: string) => void
  onNavigateToAddSupplier: () => void
}

export function ViewSuppliersTab({
  suppliers,
  loading,
  postsCountMap,
  onAddProduct,
  onManageProducts,
  onDeleteSupplier,
  onNavigateToAddSupplier,
}: ViewSuppliersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<any | null>(null)

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.country && s.country.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (Array.isArray(s.species) && s.species.some((sp: string) => sp.toLowerCase().includes(q))) ||
      (s.category && s.category.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">View Suppliers</h1>
            <span className="text-xs font-extrabold bg-blue-50 text-[#022B96] border border-blue-200/80 px-3 py-1 rounded-full">
              {suppliers.length} {suppliers.length === 1 ? 'Supplier' : 'Suppliers'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Verified seafood supplier profiles created and managed by the admin team
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, country, species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] transition"
            />
          </div>

          <button
            onClick={onNavigateToAddSupplier}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#022B96]" />
          <p className="text-sm font-bold text-slate-700">Loading Supplier Profiles...</p>
          <p className="text-xs text-slate-400">Fetching verified supplier records from database</p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            {searchQuery ? 'No matching suppliers found' : 'No suppliers registered yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No supplier profiles matched "${searchQuery}". Try a different keyword.`
              : 'Add seafood suppliers to the platform manually using the Add Supplier tab.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onNavigateToAddSupplier}
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create First Supplier Profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((supplier) => {
            const productCount = postsCountMap[supplier.id] || postsCountMap[supplier.name?.toLowerCase()] || 0
            const speciesList = Array.isArray(supplier.species)
              ? supplier.species
              : typeof supplier.species === 'string' && supplier.species
                ? supplier.species.split(',').map((s: string) => s.trim())
                : []

            return (
              <div
                key={supplier.id || supplier.slug}
                className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                {/* Supplier Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Logo or Initials */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        {supplier.logoUrl ? (
                          <img
                            src={supplier.logoUrl}
                            alt={supplier.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#022B96] to-blue-700 text-white flex items-center justify-center font-black text-sm">
                            {supplier.name?.slice(0, 2).toUpperCase() || 'SU'}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate group-hover:text-[#022B96] transition-colors">
                            {supplier.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {supplier.countryCode && (
                            <ReactCountryFlag
                              countryCode={supplier.countryCode}
                              svg
                              style={{ width: '15px', height: '11px', borderRadius: '2px', flexShrink: 0 }}
                            />
                          )}
                          <span className="text-xs text-slate-500 font-semibold truncate">
                            {supplier.country || 'Europe'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            {supplier.category || 'SEAFOOD SUPPLIER'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Products count pill */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        productCount > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {productCount > 0 ? `${productCount} ${productCount === 1 ? 'Product' : 'Products'}` : '0 Products'}
                    </span>
                  </div>

                  {/* Contact info bar */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {supplier.email && (
                      <div className="flex items-center gap-1.5 text-slate-600 truncate bg-slate-50/70 px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-[11px] font-medium">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone ? (
                      <div className="flex items-center gap-1.5 text-slate-600 truncate bg-slate-50/70 px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-[11px] font-medium">{supplier.phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 truncate bg-slate-50/70 px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-[11px] font-medium">{supplier.address || supplier.country || 'Europe'}</span>
                      </div>
                    )}
                  </div>

                  {/* Species tags */}
                  {speciesList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {speciesList.slice(0, 4).map((sp: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50/80 text-[#022B96] border border-blue-100"
                        >
                          {sp}
                        </span>
                      ))}
                      {speciesList.length > 4 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          +{speciesList.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* View public profile */}
                    <Link
                      href={`/suppliers/${supplier.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                      title="Open public profile page in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </Link>

                    {/* Manage Products */}
                    <button
                      type="button"
                      onClick={() => onManageProducts(supplier)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#022B96] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition cursor-pointer"
                    >
                      <Package className="w-3 h-3" />
                      Manage Products
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Add Product Button */}
                    <button
                      type="button"
                      onClick={() => onAddProduct(supplier)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Product
                    </button>

                    {/* Delete supplier */}
                    <button
                      type="button"
                      onClick={() => onDeleteSupplier(supplier.id, supplier.name)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Supplier Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
