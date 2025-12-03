# Walkthrough: BodyForge Store Node.js Transformation

I have transformed the static site into a functional Node.js application with a local API and database.

## Architecture Changes

1.  **Backend (Node.js + Express)**:
    *   `server.js`: Serves the frontend and provides API endpoints.
    *   `data/products.json`: Stores the product catalog.
    *   `data/orders.json`: Stores incoming orders.
2.  **Frontend**:
    *   Moved all static files to `public/`.
    *   `js/script.js`: Refactored to fetch products from `http://localhost:3000/api/products` and send orders to `http://localhost:3000/api/orders`.
    *   `index.html` & `productos.html`: Cleaned up to load content dynamically.

## How to Run

1.  **Install Dependencies** (if you haven't already):
    ```bash
    npm install
    ```
2.  **Start the Server**:
    ```bash
    node server.js
    ```
3.  **Access the App**:
    Open your browser and go to `http://localhost:3000`.

## Testing the Features

1.  **Dynamic Loading**: You should see products loading from the server on the Home and Products pages.
2.  **Shopping Cart**: Works as before, but now interacts with the dynamic product data.
3.  **Checkout**: When you complete a purchase, the order is sent to the server.
    *   Check `data/orders.json` to see your new order saved!

## Files Structure

```
/
├── server.js           # Backend server
├── package.json        # Dependencies
├── data/
│   ├── products.json   # Product database
│   └── orders.json     # Order database
└── public/             # Frontend (HTML, CSS, JS, Images)
    ├── index.html
    ├── css/
    ├── js/
    └── ...
```

## Image Updates

I have replaced the placeholder and generic images with **real product images** sourced from:
*   **Open Food Facts**: For supplements like Whey Protein, Creatine, Pre-workout, etc.
*   **Wikimedia Commons**: For accessories like the Shaker and Lifting Belt.

The `data/products.json` file has been updated with these new URLs.

