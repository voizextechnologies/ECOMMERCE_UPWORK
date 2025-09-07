// src/components/admin/ProductForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useDepartments } from '../../hooks/useSupabase';
import { Product } from '../../types';

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
  const [images, setImages] = useState<string[]>(initialData?.images || []);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedSpecs = {};
    try {
      parsedSpecs = JSON.parse(specifications);
    } catch (err) {
      alert('Invalid JSON for specifications');
      return;
    }

    console.log('Submitting product data:', {
      name,
      slug,
      description,
      price,
      originalPrice: originalPrice,
      images,
      category_id: categoryId || null,
      department_id: departmentId || null,
      brand,
      stock,
      specifications: parsedSpecs,
    });

    onSubmit({
      name,
      slug,
      description,
      price,
      originalPrice: originalPrice,
      images,
      category: '', // Will be populated by backend
      department: '', // Will be populated by backend
      category_id: categoryId || null,
      department_id: departmentId || null,
      brand,
      stock,
      specifications: parsedSpecs,
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Images (URLs)</label>
        {images.map((image, index) => (
          <div key={index} className="flex items-center mt-2 space-x-2">
            <input
              type="text"
              value={image}
              onChange={(e) => handleImageChange(index, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              placeholder="Image URL"
            />
            <Button type="button" variant="outline" onClick={() => removeImageField(index)}>Remove</Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addImageField} className="mt-2">Add Image URL</Button>
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

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Add Product')}
      </Button>
    </form>
  );
}