const CART_KEY = 'shopping_cart';

const cartService = {
    // Get cart from localStorage
    getCart: () => {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    // Add item to cart
    addToCart: (product, quantity = 1) => {
        const cart = cartService.getCart();
        const existingItemIndex = cart.findIndex(
            item => item.productId === product.productId
        );

        if (existingItemIndex > -1) {
            // Item exists, update quantity
            cart[existingItemIndex].quantity += quantity;
        } else {
            // New item
            cart.push({
                ...product,
                quantity: quantity,
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        return cart;
    },

    // Remove item from cart
    removeFromCart: (productId) => {
        const cart = cartService.getCart();
        const updatedCart = cart.filter(item => item.productId !== productId);
        localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
        return updatedCart;
    },

    // Update item quantity
    updateQuantity: (productId, quantity) => {
        const cart = cartService.getCart();
        const itemIndex = cart.findIndex(item => item.productId === productId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                return cartService.removeFromCart(productId);
            }
            cart[itemIndex].quantity = quantity;
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        }

        return cart;
    },

    // Clear cart
    clearCart: () => {
        localStorage.removeItem(CART_KEY);
        return [];
    },

    // Get cart item count
    getCartItemCount: () => {
        const cart = cartService.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    // Get cart total
    getCartTotal: () => {
        const cart = cartService.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
};

export default cartService;