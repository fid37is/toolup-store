// src/pages/api/cart/index.js - Enhanced cart API for handling cart operations
export default function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getCart(req, res);
        case 'POST':
            return addToCart(req, res);
        case 'PUT':
            return updateCartItem(req, res);
        case 'DELETE':
            return removeFromCart(req, res);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Get cart contents
async function getCart(req, res) {
    try {
        // In a real app, this would fetch from database based on user session
        // Return empty array - your frontend will populate from localStorage if this is empty
        res.status(200).json([]);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
}

// Add item to cart
async function addToCart(req, res) {
    try {
        const { productId, quantity } = req.body;
        
        // Validate required fields
        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ 
                error: 'Invalid request. ProductId and positive quantity are required.' 
            });
        }

        // Here we would typically save to a database using the productId and quantity
        console.log(`Adding product ${productId} with quantity ${quantity} to cart`);
        
        // Mock success response
        res.status(200).json({ 
            success: true, 
            message: 'Item added to cart',
            productId,
            quantity
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
}

// Update cart item quantity
async function updateCartItem(req, res) {
    try {
        const { productId, quantity } = req.body;
        
        // Validate required fields
        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ 
                error: 'Invalid request. ProductId and positive quantity are required.' 
            });
        }

        // Here we would typically update the quantity in a database
        console.log(`Updating product ${productId} to quantity ${quantity}`);
        
        // Mock success response
        res.status(200).json({ 
            success: true, 
            message: 'Cart updated',
            productId,
            quantity
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
}

// Remove item from cart
async function removeFromCart(req, res) {
    try {
        const { productId } = req.body;
        
        // Validate required fields
        if (!productId) {
            return res.status(400).json({ 
                error: 'Invalid request. ProductId is required.' 
            });
        }

        // Here we would typically remove the item from a database
        console.log(`Removing product ${productId} from cart`);
        
        // Mock success response
        res.status(200).json({ 
            success: true, 
            message: 'Item removed from cart',
            productId
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
}