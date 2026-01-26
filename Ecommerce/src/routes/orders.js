const express = require("express");
const { dbRead } = require("../db");

const router = express.Router();
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ message: "invalid user id" });
    }const result = await dbRead.query(
      `SELECT
         o.id,
         o.total,
         o.status,
         o.created_at,
         o.updated_at,
         o.shipping_name,
         o.shipping_line1,
         o.shipping_line2,
         o.shipping_city,
         o.shipping_state,
         o.shipping_postal_code,
         o.shipping_country,
         p.status AS payment_status,
         p.payment_method,
         p.transaction_id,
         p.failure_reason
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
      return res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "internal server error" });
  }
});

module.exports = router;