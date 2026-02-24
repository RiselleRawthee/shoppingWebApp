import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and foldable design.',
    price: 2999.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    stock: 15,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact TKL mechanical keyboard with Cherry MX Blue switches, RGB backlight, and USB-C connection.',
    price: 1499.99,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    category: 'Electronics',
    stock: 30,
  },
  {
    name: '27" 4K Monitor',
    description: 'Ultra-sharp 4K IPS display with 99% sRGB coverage, USB-C power delivery, and 60Hz refresh rate.',
    price: 8999.99,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    category: 'Electronics',
    stock: 8,
  },
  {
    name: '7-Port USB Hub',
    description: 'Powered USB 3.0 hub with 7 ports, individual power switches, and LED indicators.',
    price: 499.99,
    image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
    category: 'Electronics',
    stock: 50,
  },
  {
    name: '1080p Webcam',
    description: 'Full HD webcam with built-in stereo mic, autofocus, and plug-and-play USB connection.',
    price: 899.99,
    image_url: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400',
    category: 'Electronics',
    stock: 20,
  },
  {
    name: 'Smart LED Desk Lamp',
    description: 'Touch-controlled LED lamp with adjustable colour temperature, USB charging port, and memory function.',
    price: 699.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    category: 'Lighting',
    stock: 40,
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Fully adjustable mesh chair with lumbar support, 4D armrests, and breathable backrest.',
    price: 5499.99,
    image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    category: 'Furniture',
    stock: 5,
  },
  {
    name: 'Height-Adjustable Standing Desk',
    description: 'Electric sit-stand desk with memory presets, anti-collision technology, and cable management tray.',
    price: 12999.99,
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    category: 'Furniture',
    stock: 3,
  },
  {
    name: 'Aluminium Laptop Stand',
    description: 'Adjustable aluminium stand with ventilation design, non-slip base, and foldable for portability.',
    price: 349.99,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category: 'Accessories',
    stock: 60,
  },
  {
    name: 'Cable Management Kit',
    description: 'Complete desk organisation kit with cable clips, velcro ties, cable sleeves, and adhesive mounts.',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'Accessories',
    stock: 100,
  },
]

const seed = async (): Promise<void> => {
  console.log('Seeding database...')
  await prisma.review.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log(`Seeded ${products.length} products`)
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => void prisma.$disconnect())
