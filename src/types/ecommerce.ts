export type ProductCategory = 'All' | 'Furniture' | 'Lighting' | 'Ceramics' | 'Objects';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  additionalImages?: string[];
  dimensions: string;
  materials: string[];
  designer: string;
  origin: string;
  description: string;
  features: string[];
  leadTime: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFinish?: string;
}

export interface CustomerOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: 'card' | 'apple_pay' | 'wire';
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}
