```typescript
// src/types/index.ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  department: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  category_id?: string | null;
  department_id?: string | null;
  discountType?: 'percentage' | 'flat_amount'; // NEW
  discountValue?: number; // NEW
  isTaxable?: boolean;
  isShippingExempt?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Department {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  categories: Category[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

// Updated CartItem interface to match Supabase join structure
export interface CartItem {
  id: string; // cart_item id
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  products: Product; // Nested product object from join
  product_variants: ProductVariant | null; // Nested variant object from join
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addresses: Address[];
  orders: Order[];
  wishlist: string[];
  role?: string;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  deliveryMethod: 'shipping' | 'click-collect';
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  category: string;
}

export interface DIYArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
}
```