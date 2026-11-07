import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore, auth, handleFirestoreError, OperationType } from './firebase';
import { CartItem, CustomerOrder } from '../types/ecommerce';

/**
 * Save user cart to Firestore if logged in
 */
export async function saveUserCartToFirestore(userId: string, items: CartItem[]): Promise<void> {
  if (!userId) return;
  try {
    const cartRef = doc(firestore, 'carts', userId);
    // Keep payload clean and lightweight
    const simplified = items.map(i => ({
      productId: i.product.id,
      quantity: i.quantity,
      selectedFinish: i.selectedFinish || 'Default'
    }));

    await setDoc(cartRef, {
      userId,
      itemsJson: JSON.stringify(simplified),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not persist cart to Firestore:', err);
  }
}

/**
 * Load user cart from Firestore
 */
export async function loadUserCartFromFirestore(userId: string): Promise<{ productId: string; quantity: number; selectedFinish?: string }[] | null> {
  if (!userId) return null;
  try {
    const cartRef = doc(firestore, 'carts', userId);
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.itemsJson) {
        return JSON.parse(data.itemsJson);
      }
    }
    return null;
  } catch (err) {
    console.warn('Could not load cart from Firestore:', err);
    return null;
  }
}

/**
 * Create a new Customer Order in Firestore
 */
export async function createFirestoreOrder(order: CustomerOrder): Promise<void> {
  try {
    const orderRef = doc(firestore, 'orders', order.id);
    const orderPayload = {
      id: order.id,
      userId: order.userId,
      customerName: order.customerName.slice(0, 100),
      customerEmail: order.customerEmail.slice(0, 128),
      shippingAddress: `${order.shippingAddress}, ${order.city}, ${order.postalCode}, ${order.country}`.slice(0, 300),
      subtotal: Math.round(order.subtotal * 100) / 100,
      total: Math.round(order.total * 100) / 100,
      shippingFee: order.shippingFee,
      paymentMethod: order.paymentMethod,
      itemsCount: order.items.length,
      itemsJson: JSON.stringify(order.items),
      status: 'CONFIRMED',
      createdAt: order.createdAt || new Date().toISOString()
    };

    await setDoc(orderRef, orderPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `orders/${order.id}`);
    throw err;
  }
}

/**
 * Load customer order history
 */
export async function loadUserOrders(userId: string): Promise<CustomerOrder[]> {
  if (!userId) return [];
  try {
    const ordersCol = collection(firestore, 'orders');
    const q = query(
      ordersCol,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const results: CustomerOrder[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      let parsedItems = [];
      try {
        if (data.itemsJson) parsedItems = JSON.parse(data.itemsJson);
      } catch (e) {
        parsedItems = [];
      }
      results.push({
        id: data.id,
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        shippingAddress: data.shippingAddress,
        city: '',
        postalCode: '',
        country: '',
        paymentMethod: data.paymentMethod || 'card',
        items: parsedItems,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee || 0,
        total: data.total || data.subtotal,
        status: data.status || 'CONFIRMED',
        createdAt: data.createdAt
      });
    });
    return results;
  } catch (err) {
    console.warn('Could not load orders from Firestore:', err);
    return [];
  }
}

/**
 * Save user wishlist to Firestore if logged in
 */
export async function saveUserWishlistToFirestore(userId: string, productIds: string[]): Promise<void> {
  if (!userId) return;
  try {
    const wishlistRef = doc(firestore, 'wishlists', userId);
    await setDoc(wishlistRef, {
      userId,
      productIdsJson: JSON.stringify(productIds),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not persist wishlist to Firestore:', err);
  }
}

/**
 * Load user wishlist from Firestore
 */
export async function loadUserWishlistFromFirestore(userId: string): Promise<string[] | null> {
  if (!userId) return null;
  try {
    const wishlistRef = doc(firestore, 'wishlists', userId);
    const snap = await getDoc(wishlistRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.productIdsJson) {
        return JSON.parse(data.productIdsJson);
      }
    }
    return null;
  } catch (err) {
    console.warn('Could not load wishlist from Firestore:', err);
    return null;
  }
}

