const express = require('express');
require('dotenv').config();
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart")
const ordersRoutes = require("./routes/orders");


const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ok: true});
});

app.use("/users", usersRoutes);
app.use("/products", productsRoutes );
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});