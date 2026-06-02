import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Package, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SEOHead from '../../components/seo/SEOHead';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { extractUrlFromEmbed, isDirectImageLink } from '../../utils/helpers';

const BuyDetails = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      const res = await fetch(`${apiUrl}/sales-items/${itemId}`);
      if (!res.ok) throw new Error('Item not found');
      const data = await res.json();
      setItem(data);
    } catch (err) {
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const imagesArr = item ? (typeof item.Images === 'string' ? JSON.parse(item.Images) : (item.Images || [])) : [];
  const specsObj = item ? (typeof item.Specs === 'string' ? JSON.parse(item.Specs) : (item.Specs || {})) : {};

  const handleNextImage = () => {
      if (imagesArr.length > 0) {
          setCurrentImageIndex((prev) => (prev + 1) % imagesArr.length);
      }
  };

  const handlePrevImage = () => {
      if (imagesArr.length > 0) {
          setCurrentImageIndex((prev) => (prev - 1 + imagesArr.length) % imagesArr.length);
      }
  };

  const onEnquireSubmit = async (data) => {
      try {
          const payload = {
              EnquiryDate: new Date().toISOString().split('T')[0],
              CustomerName: data.name,
              ContactNumber: data.mobile,
              NatureOfQuery: 'Sales item enquiry',
              QueryDetails: `Interested in buying: ${item.Name} (Item ID: ${item.ItemId}). Message: ${data.message || 'No additional message.'}`
          };

          const res = await fetch(`${apiUrl}/enquiries/public`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error('Failed to send enquiry');

          toast.success('Enquiry sent! We will contact you shortly.');
          setIsEnquiryModalOpen(false);
          reset();
      } catch (err) {
          toast.error(err.message);
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
               <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
      );
  }

  if (!item) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
              <Package className="text-slate-300 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Item not found</h2>
              <Link to="/buy" className="text-blue-600 hover:underline flex items-center gap-2">
                  <ArrowLeft size={16} /> Back to Products
              </Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEOHead title={`${item.Name} | Buy`} description={`View details for ${item.Name}`} />

      <div className="bg-slate-900 pb-20">
          <Navbar />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 -mt-10 mb-12">

        <Link to="/buy" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">

                {/* Image Carousel */}
                <div className="bg-slate-100 p-6 flex flex-col items-center justify-center relative min-h-[400px]">
                    {imagesArr.length > 0 ? (
                        <>
                            {(() => {
                                const currentUrl = extractUrlFromEmbed(imagesArr[currentImageIndex]);
                                const isDirectImage = isDirectImageLink(currentUrl) || !currentUrl.includes('drive.google.com'); // Best guess for non-drive embed URLs if needed, but the original intent was embed URLs like google drive. We use iframe for embeds unless it's a direct image.

                                return isDirectImage ? (
                                    <img
                                        src={currentUrl}
                                        alt={`${item.Name} - View ${currentImageIndex + 1}`}
                                        className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm w-full h-full"
                                    />
                                ) : (
                                    <iframe
                                        src={currentUrl}
                                        title={`${item.Name} - View ${currentImageIndex + 1}`}
                                        className="max-w-full max-h-[500px] w-full h-full border-0 rounded-lg shadow-sm"
                                        allow="autoplay"
                                    ></iframe>
                                );
                            })()}

                            {imagesArr.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-slate-800 transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-slate-800 transition-colors"
                                    >
                                        <ChevronRight size={24} />
                                    </button>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/50 backdrop-blur px-3 py-1.5 rounded-full">
                                        {imagesArr.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-slate-400">
                            <Package size={64} className="mb-4 opacity-50" />
                            <p>No images available</p>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="p-8 lg:p-12 flex flex-col">
                    <div className="mb-2 flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                            {item.Category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            item.Status === 'Available'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {item.Status === 'Available' ? 'Available' : 'Out of Stock'}
                        </span>
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                        {item.Name}
                    </h1>

                    <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100 flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Specifications</h3>
                        {Object.keys(specsObj).length > 0 ? (
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                {Object.entries(specsObj).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                        <dt className="text-xs text-slate-500 uppercase tracking-wide font-medium">{key}</dt>
                                        <dd className="text-sm font-semibold text-slate-900">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="text-sm text-slate-500 italic">No specific details listed for this item.</p>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-blue-50 text-blue-800 px-6 py-4 rounded-xl flex items-center gap-4">
                            <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Interested in buying?</p>
                                <p className="text-xs text-blue-600/80">Contact us for pricing</p>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="w-full sm:w-auto self-center h-full text-lg shadow-md"
                            onClick={() => setIsEnquiryModalOpen(true)}
                        >
                            Enquire Now
                        </Button>
                    </div>
                </div>

            </div>
        </div>
      </main>

      <Footer />

      {/* Enquiry Modal */}
      <Modal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          title="Product Enquiry"
      >
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-600 mb-1">Enquiring about:</p>
              <p className="font-semibold text-slate-900">{item.Name}</p>
          </div>

          <form onSubmit={handleSubmit(onEnquireSubmit)} className="space-y-4">
              <Input
                  label="Your Name *"
                  {...register('name', { required: 'Name is required' })}
                  error={errors.name?.message}
              />

              <Input
                  label="Mobile Number *"
                  {...register('mobile', { required: 'Mobile number is required' })}
                  error={errors.mobile?.message}
              />

              <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Message (Optional)</label>
                  <textarea
                      {...register('message')}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any specific questions about this item?"
                  />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEnquiryModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      Send Enquiry
                  </Button>
              </div>
          </form>
      </Modal>

    </div>
  );
};

export default BuyDetails;
