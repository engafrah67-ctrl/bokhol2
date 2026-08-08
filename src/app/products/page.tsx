'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { BlurGate } from '@/components/blur-gate'

const CATEGORIES = ['All', 'Finfish', 'Shellfish', 'Cephalopods']

interface ProductCardData {
  slug: string
  name: string
  category: string
  scientificName: string
  imageUrl: string
  suppliersCount: number
  avgPrice: string
  topOrigin: string
}

const PRODUCTS_DATA: ProductCardData[] = [
  {
    slug: 'mackerel',
    name: 'Mackerel',
    category: 'Finfish',
    scientificName: 'Scomber scombrus',
    imageUrl: '/mackerel.png',
    suppliersCount: 20,
    avgPrice: '€5.31 / kg',
    topOrigin: 'Norway',
  },
  {
    slug: 'tuna',
    name: 'Tuna',
    category: 'Finfish',
    scientificName: 'Thunnus',
    imageUrl: '/tuna.png',
    suppliersCount: 18,
    avgPrice: '€6.11 / kg',
    topOrigin: 'Spain',
  },
  {
    slug: 'atlantic-cod',
    name: 'Atlantic Cod',
    category: 'Finfish',
    scientificName: 'Gadus morhua',
    imageUrl: '/cod.png',
    suppliersCount: 16,
    avgPrice: '€6.91 / kg',
    topOrigin: 'Greece',
  },
  {
    slug: 'atlantic-salmon',
    name: 'Atlantic Salmon',
    category: 'Finfish',
    scientificName: 'Salmo salar',
    imageUrl: '/salmon.png',
    suppliersCount: 14,
    avgPrice: '€7.71 / kg',
    topOrigin: 'Iceland',
  },
  {
    slug: 'shrimp',
    name: 'Shrimp',
    category: 'Shellfish',
    scientificName: 'Caridea',
    imageUrl: '/shrimp.png',
    suppliersCount: 12,
    avgPrice: '€8.51 / kg',
    topOrigin: 'Vietnam',
  },
]

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = PRODUCTS_DATA.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-transparent pb-12">
      {/* Hero Header */}
      <section 
        className="relative overflow-hidden py-16 flex flex-col items-center text-center mb-10 border-b border-white/50"
      >
        <div className="relative z-10 max-w-3xl mx-auto px-4 flex flex-col items-center">
          {/* Search Bar */}
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 w-full max-w-lg bg-white/90 border border-blue-200 p-1.5 rounded-xl flex items-center shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all"
          >
            <div className="flex items-center pl-4 pr-3 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input 
              type="text" 
              placeholder="Search by species or scientific name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400 flex-1 min-w-0 py-2 mr-2"
            />
            <button 
              type="submit"
              className="flex-none bg-[#022B96] hover:bg-[#011a5e] text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeCategory === category
                  ? 'bg-[#022B96] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Link href={`/products/${product.slug}`} key={product.slug} className="block">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group cursor-pointer flex flex-col h-full">
                  
                  {/* Card Header */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 flex justify-between items-center m-2 rounded-xl">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#022B96] transition-colors text-sm">
                      {product.name}
                    </h3>
                    <span className="text-slate-400 group-hover:text-[#022B96] transition-colors font-medium">→</span>
                  </div>
                  
                  {/* Image */}
                  <div className="w-full px-4 my-2">
                    <div className="w-full h-32 relative">
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill
                        className="object-contain mix-blend-multiply dark:mix-blend-screen dark:invert group-hover:scale-110 transition-transform duration-500"
                        style={{ filter: 'brightness(1.05) contrast(1.1)' }}
                      />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="px-5 pb-5 mt-auto text-xs">
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-500">Live offers</span>
                      <span className="font-bold text-slate-800">
                        <BlurGate>{product.suppliersCount}</BlurGate>
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-500">Price range</span>
                      <span className="font-bold text-slate-800">
                        <BlurGate>{product.avgPrice}</BlurGate>
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-500">Top categories</span>
                      <span className="font-bold text-slate-800">{product.category}</span>
                    </div>
                    <div className="flex justify-between pt-2.5 pb-1">
                      <span className="text-slate-500">Last updated</span>
                      <span className="font-medium text-slate-800">July 26, 2026</span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-500 font-medium">No products found for &quot;{searchQuery}&quot;</p>
          </div>
        )}

      </div>
    </main>
  )
}
