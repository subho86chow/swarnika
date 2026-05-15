# Swarnika — THE ARCHIVE | House of Jewelry

## Overview

Swarnika is a luxury e-commerce platform for high-jewelry. It bridges ancestral craftsmanship with contemporary silhouettes, offering a curated catalog of necklaces, rings, earrings, and bridal sets. The platform provides a refined shopping experience with personalized AI assistance, dynamic promotions, and a comprehensive admin dashboard for inventory and content management.

## Goals

1. Deliver an elegant, performant storefront that reflects luxury brand values
2. Provide seamless product discovery, cart management, and coupon redemption
3. Empower administrators to manage products, categories, hero content, coupons, and site settings without code changes
4. Offer AI-powered customer support via an embedded chatbot

## Core User Flow

1. Visitor lands on the homepage with hero slider and curated categories
2. Browses products by category or tag (bestsellers, new arrivals)
3. Views product detail with images, descriptions, details list, and related coupons
4. Adds items to cart or favorites (requires sign-in)
5. Applies coupons and reviews cart
6. Proceeds to checkout, selects delivery address, reviews order summary with GST + shipping
7. Pays securely via Razorpay
8. Views order history with status and shipping details
9. Reaches out via contact form or AI chatbot for inquiries

## Features

### Storefront

- Hero image carousel with configurable slides
- Category grid with animated hover effects
- Product cards with image galleries, pricing, and badges
- Product detail pages with recently viewed tracking
- Cart with quantity management and coupon application
- Favorites/wishlist
- Recently viewed products
- AI chatbot powered by OpenRouter
- Campaign carousel for promotions
- Contact, FAQ, Care Guide, About, and Shipping info pages
- Newsletter signup
- Buy Now — direct checkout without cart
- Checkout with address selection, GST, and shipping calculation
- Razorpay payment integration
- Order history with tracking
- Pincode serviceability check on product pages

### Admin Dashboard

- Product CRUD with image uploads (Cloudinary)
- Category CRUD
- Hero image management
- Coupon creation and management
- Tag management
- Admin email access control
- Site content configuration (announcement bar, hero text, tax rate, free shipping threshold)
- Order management — view all paid orders

## Scope

### In Scope

- Public-facing jewelry catalog and browsing
- User authentication and account pages
- Cart, favorites, and recently viewed (client-side + server persistence)
- Coupon system with multiple discount types and scopes
- Admin dashboard for content, inventory, and order management
- AI chatbot for customer queries
- Image upload and management via Cloudinary
- Razorpay payment gateway integration
- Delhivery logistics integration (pincode serviceability + shipment creation)

### Out of Scope

- Real-time inventory tracking beyond in-stock boolean
- Multi-language support
- Advanced shipping rate calculation (flat rate + free threshold only)
- Warehouse management and multi-location fulfillment

## Success Criteria

1. A signed-in user can add products to cart, apply coupons, manage favorites, and complete checkout with Razorpay
2. An admin can log in and perform full CRUD on products, categories, coupons, hero images, and view orders
3. The homepage hero, announcement bar, campaigns, tax rate, and free shipping threshold are editable from the admin panel
4. `npm run build` completes without errors
5. All pages load within acceptable performance budgets using Vercel KV caching
6. A user can check pincode serviceability on any product page
7. Order history displays real data with items, status, shipping address, and payment ID
