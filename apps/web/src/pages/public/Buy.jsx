import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Package } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SEOHead from '../../components/seo/SEOHead';
import { extractUrlFromEmbed, isDirectImageLink } from '../../utils/helpers';

const Buy = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${apiUrl}/sales-items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.Name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.Category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead title="Buy | Rassi & Company" description="Browse our selection of refurbished motors and motor spares." />

      {/* Needs a darker background wrapper for the public Navbar so links are visible since Navbar text is white */}
      <div className="bg-slate-900 pb-20">
          <Navbar />
      </div>

      <main className="container mx-auto px-4 py-12 -mt-10">

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 mt-12 border border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Our Products</h1>

            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['All', 'Refurbished Motors', 'Motor Spares'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Package className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-medium text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-500">We couldn't find any products matching your criteria.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const imagesArr = typeof item.Images === 'string' ? JSON.parse(item.Images) : (item.Images || []);
                    const primaryImage = imagesArr.length > 0 ? imagesArr[0] : null;

                    return (
                        <Link
                            key={item.ItemId}
                            to={`/buy/${item.ItemId}`}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden group flex flex-col h-full"
                        >
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                {primaryImage ? (
                                    (() => {
                                        const currentUrl = extractUrlFromEmbed(primaryImage);
                                        const isDirectImage = isDirectImageLink(currentUrl) || !currentUrl.includes('drive.google.com');
                                        return isDirectImage ? (
                                            <img
                                                src={currentUrl}
                                                alt={item.Name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                                                <iframe
                                                    src={currentUrl}
                                                    title={item.Name}
                                                    className="w-full h-full border-0 pointer-events-none"
                                                    allow="autoplay"
                                                    tabIndex="-1"
                                                ></iframe>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <Package size={48} className="text-slate-300" />
                                )}

                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-slate-800 text-xs font-semibold rounded-full shadow-sm">
                                        {item.Category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{item.Name}</h3>

                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        item.Status === 'Available'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {item.Status === 'Available' ? 'Available' : 'Out of Stock'}
                                    </span>
                                    <span className="text-blue-600 font-medium text-sm group-hover:underline">
                                        View Details →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Buy;
