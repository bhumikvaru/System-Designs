const express = require('express');
const { dbWrite, dbRead } = require("../db");


const router = express.Router();

router.post('/add', async (req, res) => {
    const client = await dbWrite.connect();
    try {
        const { user_id, product_id, quantity } = req.body;
        if (!user_id || !product_id || !quantity || quantity <= 0) {
            return res.status(400).json({ message: "Invalid input" });
        }
        await client.query('BEGIN');
        const cartRes = await client.query(
  `SELECT id FROM carts WHERE user_id = $1 AND state = 'active' LIMIT 1`,
  [user_id]
);

        let cartId;
        if (cartRes.rows.length === 0) {
            const newCart = await client.query(
                `INSERT INTO carts (user_id, state) VALUES ($1, 'active') RETURNING id`,
                [user_id]);
            cartId = newCart.rows[0].id;
        }
        else {
            cartId = cartRes.rows[0].id;
        }

        const productRes = await client.query(
            `SELECT id, price, total_stock, reserved_stock, status 
            FROM products WHERE id = $1`, [product_id]
        );
        if (productRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "product not found" })
        }

        const product = productRes.rows[0];
        if (product.status !== "in_stock") {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "product not available" });
        }
        const available = product.total_stock - product.reserved_stock;
        if (available < quantity) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "not enough stock available" });
        }
        await client.query(
            `UPDATE products
       SET reserved_stock = reserved_stock + $1,
           updated_at = NOW()
       WHERE id = $2`,
            [quantity, product_id]
        );

        const existingItem = await client.query(
            `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
            [cartId, product_id]
        );
        if (existingItem.rows.length === 0) {
            await client.query(
                `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
                [cartId, product_id, quantity, product.price]
            );
        } else {
            await client.query(
                `UPDATE cart_items
         SET quantity = quantity + $1,
             unit_price = $2,
             updated_at = NOW()
         WHERE cart_id = $3 AND product_id = $4`,
                [quantity, product.price, cartId, product_id]
            );
        }
        await client.query("COMMIT");

        return res.status(200).json({
            message: "added to cart",
            cart_id: cartId,
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({ message: "internal server error" });
    } finally {
        client.release();
    }
});


router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ message: "invalid user id" });
    }

    // get active cart
    const cartRes = await dbRead.query(
      `SELECT id FROM carts WHERE user_id = $1 AND state = 'active' LIMIT 1`,
      [userId]
    );

    if (cartRes.rows.length === 0) {
      return res.json({ cart: null, items: [], total: 0 });
    }
    const cartId = cartRes.rows[0].id;
    const itemsRes = await db.query(
      `SELECT 
         ci.product_id,
         ci.quantity,
         ci.unit_price,
         p.name,
         p.image_url,
         p.price AS current_price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cartId]
    );
    const items = itemsRes.rows.map((it) => {
      const line_total = Number(it.unit_price) * Number(it.quantity);
      return { ...it, line_total };
    });
    const total = items.reduce((sum, it) => sum + it.line_total, 0);

    return res.json({
      cart: { id: cartId },
      items,
      total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "internal server error" });
  }
});

router.post("/checkout", async (req, res) => {
  const client = await db.connect();

  try {
    const {
      user_id,
      shipping_name,
      shipping_line1,
      shipping_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country,
      payment_method,
      simulate_failure, // optional for testing
    } = req.body;
  if (
      !user_id ||
      !shipping_name ||
      !shipping_line1 ||
      !shipping_city ||
      !shipping_postal_code ||
      !shipping_country ||
      !payment_method
    ) {
      return res.status(400).json({ message: "missing required fields" });
    }
    await client.query("BEGIN");
const cartRes = await client.query(
      `SELECT id FROM carts WHERE user_id = $1 AND state = 'active' LIMIT 1`,
      [user_id]
    );

    if (cartRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "no active cart" });
    }

    const cartId = cartRes.rows[0].id;

    // 2) load cart items
    const itemsRes = await client.query(
      `SELECT product_id, quantity, unit_price
       FROM cart_items
       WHERE cart_id = $1`,
      [cartId]
    );

        if (itemsRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "cart is empty" });
    }

    const total = itemsRes.rows.reduce((sum, it) => {
      return sum + Number(it.unit_price) * Number(it.quantity);
    }, 0);
const orderRes = await client.query(
      `INSERT INTO orders (
         user_id, cart_id, total, status,
         shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state,
         shipping_postal_code, shipping_country
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        user_id,
        cartId,
        total,
        "in_progress",
        shipping_name,
        shipping_line1,
        shipping_line2 || null,
        shipping_city,
        shipping_state || null,
        shipping_postal_code,
        shipping_country,
      ]
    );

        const orderId = orderRes.rows[0].id;
    const paymentStatus = simulate_failure ? "failed" : "success";
    const failureReason = simulate_failure ? "simulated failure" : null;
const paymentRes = await client.query(
      `INSERT INTO payments (order_id, amount, transaction_id, payment_method, status, failure_reason)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [
        orderId,
        total,
        `txn_${Date.now()}`, // internal transaction id (simple)
        payment_method,
        paymentStatus,
        failureReason,
      ]
    );
    const paymentId = paymentRes.rows[0].id;

    if (paymentStatus === "failed") {
      // mark order failed, keep cart active so user can retry
      await client.query(
        `UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await client.query("COMMIT");
      return res.status(400).json({
        message: "payment failed",
        order_id: orderId,
        payment_id: paymentId,
      });
    }
        for (const item of itemsRes.rows) {
      await client.query(
        `UPDATE products
         SET total_stock = total_stock - $1,
             reserved_stock = reserved_stock - $1,
             updated_at = NOW()
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }
    
        await client.query(
      `UPDATE carts SET state = 'checked_out', updated_at = NOW() WHERE id = $1`,
      [cartId]
    );

        await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

 await client.query(
      `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1`,
      [orderId]
    );
await client.query("COMMIT");

    return res.status(200).json({
      message: "checkout success",
      order_id: orderId,
      payment_id: paymentId,
      total,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "internal server error" });
  } finally {
    client.release();
  }
});
module.exports = router;

