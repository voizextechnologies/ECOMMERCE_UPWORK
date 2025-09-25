// src/components/admin/ProductForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { useDepartments } from '../../hooks/useSupabase';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase'; // Import supabase client
import { Trash2, UploadCloud } from 'lucide-react'; // Import icons

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'reviewCount' | 'rating'>) => void;
  loading: boolean;
  error: string | null;
}

export function ProductForm({ initialData, onSubmit, loading, error }: ProductFormProps) {
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [originalPrice, setOriginalPrice] = useState<number | null>(initialData?.originalPrice ?? null);
  const [images, setImages] = useState<string[]>(initialData?.images || []); // Stores URLs of uploaded images
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Stores File objects selected by user
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [departmentId, setDepartmentId] = useState(initialData?.department_id || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [specifications, setSpecifications] = useState<string>(
    initialData?.specifications ? JSON.stringify(initialData.specifications, null, 2) : '{}'
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setDescription(initialData.description);
      setPrice(initialData.price);
      setOriginalPrice(initialData.originalPrice ?? null);
      setImages(initialData.images || []);
      setCategoryId(initialData.category_id || '');
      setDepartmentId(initialData.department_id || '');
      setBrand(initialData.brand);
      setStock(initialData.stock);
      setSpecifications(initialData.specifications ? JSON.stringify(initialData.specifications, null, 2) : '{}');
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadError(null); // Clear previous upload errors
    }
  };

  const handleUploadImages = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select files to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    const uploadedImageUrls: string[] = [];

    for (const file of selectedFiles) {
      const filePath = `products/${Date.now()}-${file.name}`; // Unique path for each file
      const { data, error: uploadError } = await supabase.storage
        .from('product-images') // Ensure this bucket exists in Supabase Storage
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        setUploadError(`Failed to upload ${file.name}: ${uploadError.message}`);
        setUploading(false);
        return; // Stop on first error
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        uploadedImageUrls.push(publicUrlData.publicUrl);
      }
    }

    setImages((prevImages) => [...prevImages, ...uploadedImageUrls]);
    setSelectedFiles([]); // Clear selected files after successful upload
    setUploading(false);
  }, [selectedFiles]);

  const removeImage = (indexToRemove: number) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedSpecs = {};
    try {
      parsedSpecs = JSON.parse(specifications);
    } catch (err) {
      alert('Invalid JSON for specifications');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image for the product.');
      return;
    }

    onSubmit({
      name,
      slug,
      description,
      price,
      originalPrice: originalPrice,
      images, // Use the state that holds uploaded image URLs
      category: '', // Will be populated by backend
      department: '', // Will be populated by backend
      category_id: categoryId || null,
      department_id: departmentId || null,
      brand,
      stock,
      specifications: parsedSpecs,
    });
  };

  const handleOriginalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setOriginalPrice(null);
    } else {
      const parsedValue = parseFloat(value);
      setOriginalPrice(isNaN(parsedValue) ? null : parsedValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">Original Price ($) (Optional)</label>
          <input
            type="number"
            id="originalPrice"
            value={originalPrice ?? ''}
            onChange={handleOriginalPriceChange}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
              <img src={imageUrl} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md hover:bg-red-600"
                aria-label="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <input
          type="file"
          id="imageUpload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-brown-100 file:text-brown-700
            hover:file:bg-brown-200"
        />
        {selectedFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: {selectedFiles.map(file => file.name).join(', ')}
          </div>
        )}
        {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
        <Button
          type="button"
          onClick={handleUploadImages}
          disabled={selectedFiles.length === 0 || uploading}
          className="mt-4"
        >
          {uploading ? (
            <>
              <UploadCloud className="w-4 h-4 mr-2 animate-pulse" /> Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 mr-2" /> Upload Images
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">Department</label>
          <select
            id="departmentId"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setCategoryId('');
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          >
            <option value="">Select Department</option>
            {departmentsLoading ? (
              <option disabled>Loading departments...</option>
            ) : departmentsError ? (
              <option disabled>Error loading departments</option>
            ) : (
              departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))
            )}
          </select>
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
            disabled={!departmentId}
          >
            <option value="">Select Category</option>
            {departmentId && departments.find(d => d.id === departmentId)?.categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="specifications" className="block text-sm font-medium text-gray-700">Specifications (JSON)</label>
        <textarea
          id="specifications"
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm font-mono"
          placeholder='{"weight": "10kg", "color": "red"}'
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">Enter product specifications as a JSON object.</p>
      </div>

      <Button type="submit" disabled={loading || uploading}>
        {loading || uploading ? 'Saving...' : (initialData ? 'Update Product' : 'Add Product')}
      </Button>
    </form>
  );
}
