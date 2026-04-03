import { PrismaClient } from '@prisma/client';
import { products, collections } from '../app/lib/data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Collections...');
  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { name: collection.name },
      update: {},
      create: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        image: collection.image,
      },
    });
  }

  console.log('Seeding Products...');
  for (const product of products) {
    // Collect all unique tags and create them
    const tags = product.tags || [];
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { name: tag },
        update: {},
        create: { name: tag },
      });
    }

    // Prepare tags for connection
    const tagConnections = tags.map((t) => ({ name: t }));

    // Upsert the main product
    const createdProduct = await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        name: product.name,
        collection: product.collection,
        price: product.price,
        originalPrice: product.originalPrice,
        description: product.description,
        category: product.category,
        inStock: product.inStock,
        badge: product.badge,
        tags: { connect: tagConnections },
      },
    });

    // Create product images
    if (product.images) {
      for (const imgUrl of product.images) {
        await prisma.productImage.create({
          data: {
            url: imgUrl,
            productId: createdProduct.id,
          },
        });
      }
    } else if (product.image) {
      await prisma.productImage.create({
        data: {
          url: product.image,
          productId: createdProduct.id,
        },
      });
    }

    // Create product details
    if (product.details) {
      for (const detail of product.details) {
        await prisma.productDetail.create({
          data: {
            text: detail,
            productId: createdProduct.id,
          },
        });
      }
    }
  }

  console.log('Seeding Site Content...');
  const siteContentItems = [
    { key: "hero_title", value: 'Ancient Spirit,\nModern Grace.' },
    { key: "hero_subtitle", value: 'A curation of high-jewelry pieces that bridge the gap between ancestral craftsmanship and contemporary silhouettes. Each piece a quiet testament to eternal beauty.' },
    { key: "announcement_texts", value: JSON.stringify([
      "Complimentary express shipping on all orders above ₹50,000",
      "Bespoke commissions by appointment",
      "Ethically sourced gemstones — certified conflict-free",
      "Lifetime warranty on all pieces from The Archive",
      "Private viewings available at our flagship salons"
    ])}
  ];

  for (const content of siteContentItems) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: {},
      create: content,
    });
  }

  console.log('Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
