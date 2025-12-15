import { NextResponse } from "next/server";
import { z } from "zod";
import api from "@/lib/axios";

/**
 * Checkout API Route
 * 
 * Validates checkout data and creates an order in the database
 * via the backend API
 */

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(3),
  country: z.string().min(2),
});

const paymentSchema = z.object({
  method: z.enum(["card", "cash"]),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

const orderSchema = z.object({
  address: addressSchema,
  payment: paymentSchema,
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().int().positive(),
        image: z.string().optional(),
      })
    )
    .min(1),
  totals: z.object({
    subtotal: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    total: z.number().nonnegative(),
  }),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = orderSchema.parse(payload);

    // Get cookies from request to forward authentication
    const cookies = request.headers.get("cookie") || "";

    // Prepare order data for backend API
    const orderData = {
      orderItems: data.items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image || "",
        price: item.price,
        product: item.id, // Product ID
      })),
      shippingAddress: {
        address: `${data.address.address}, ${data.address.city}`,
        city: data.address.city,
        postalCode: data.address.zipCode,
        country: data.address.country || "India",
        state: data.address.state,
        firstName: data.address.firstName,
        lastName: data.address.lastName,
        email: data.address.email,
        phone: data.address.phone,
      },
      paymentMethod: data.payment.method === "card" ? "Card" : "Cash on Delivery",
      itemsPrice: data.totals.subtotal,
      taxPrice: 0, // Can be calculated if needed
      shippingPrice: data.totals.shipping,
      totalPrice: data.totals.total,
    };

    // Call backend API to create order
    const response = await api.post("/orders", orderData, {
      headers: {
        Cookie: cookies, // Forward cookies for authentication
      },
      withCredentials: true,
    });

    if (response.data && response.data._id) {
      return NextResponse.json({
        success: true,
        orderId: response.data._id,
        estimatedDelivery: "3-5 business days",
        totals: data.totals,
        message: "Order placed successfully.",
      });
    } else {
      throw new Error("Failed to create order");
    }
  } catch (error: any) {
    console.error("Checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid checkout request",
          issues: error.flatten(),
        },
        { status: 400 }
      );
    }

    // Handle API errors
    if (error.response) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.response.data?.message ||
            "Unable to process order. Please try again.",
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to process order right now" },
      { status: 500 }
    );
  }
}
