const CART_KEY = 'shopping_cart';

// Generate unique key for cart item (includes variant info)
const getCartItemKey = (product) => {
    if (product.selectedColor && product.selectedSize) {
        return `${product.productId}-${product.selectedColor}-${product.selectedSize}`;
    }
    return `${product.productId}`;
};

const cartService = {
    // Get cart from localStorage
    getCart: () => {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    // Add item to cart (handles variants)
    addToCart: (product, quantity = 1) => {
        const cart = cartService.getCart();
        const itemKey = getCartItemKey(product);
        
        const existingItemIndex = cart.findIndex(item => 
            getCartItemKey(item) === itemKey
        );

        if (existingItemIndex > -1) {
            // Item exists (same product + variant) - update quantity
            cart[existingItemIndex].quantity += quantity;
        } else {
            // New item - add to cart with unique key
            cart.push({
                ...product,
                cartItemKey: itemKey, // Store key for easy identification
                quantity: quantity,
                addedAt: new Date().toISOString(),
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        return cart;
    },

    // Remove item from cart using unique key
    removeFromCart: (cartItemKey) => {
        const cart = cartService.getCart();
        const updatedCart = cart.filter(item => item.cartItemKey !== cartItemKey);
        localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        return updatedCart;
    },

    // Update item quantity using unique key
    updateQuantity: (cartItemKey, quantity) => {
        const cart = cartService.getCart();
        const itemIndex = cart.findIndex(item => item.cartItemKey === cartItemKey);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                return cartService.removeFromCart(cartItemKey);
            }
            cart[itemIndex].quantity = quantity;
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
        }

        return cart;
    },

    // Clear cart
    clearCart: () => {
        localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new Event('cartUpdated'));
        return [];
    },

    // Get cart item count (total quantity across all items)
    getCartItemCount: () => {
        const cart = cartService.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    // Get cart total price
    getCartTotal: () => {
        const cart = cartService.getCart();
        return cart.reduce((total, item) => {
            const price = item.discountPrice || item.sellingPrice || item.price || 0;
            return total + (parseFloat(price) * item.quantity);
        }, 0);
    },

    // Get quantity for a specific product variant in cart
    getVariantQuantity: (productId, color, size) => {
        const cart = cartService.getCart();
        const key = color && size 
            ? `${productId}-${color}-${size}` 
            : `${productId}`;
        
        const item = cart.find(item => item.cartItemKey === key);
        return item ? item.quantity : 0;
    },

    // Get total quantity across all variants of a product
    getProductTotalQuantity: (productId) => {
        const cart = cartService.getCart();
        return cart
            .filter(item => item.productId === parseInt(productId))
            .reduce((sum, item) => sum + item.quantity, 0);
    },

    // Get all variants of a product in cart
    getProductVariants: (productId) => {
        const cart = cartService.getCart();
        return cart.filter(item => item.productId === parseInt(productId));
    },
};

export default cartService;