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

const reviewsByProduct: { reviewer_name: string; rating: number; comment: string }[][] = [
  // Wireless Noise-Cancelling Headphones
  [
    { reviewer_name: 'James Mitchell', rating: 5, comment: 'Incredible noise cancellation — I can finally focus at the office. Battery life is exactly as advertised.' },
    { reviewer_name: 'Sara Nkosi', rating: 4, comment: 'Very comfortable for long sessions. ANC is top-notch. Wish the carrying case were a bit more rigid.' },
    { reviewer_name: 'David Patel', rating: 5, comment: 'Best headphones I have owned. Crystal-clear audio and the fold-flat design fits perfectly in my bag.' },
    { reviewer_name: 'Lerato Dlamini', rating: 3, comment: 'Sound quality is good but Bluetooth range drops a bit through walls. Works fine for desk use.' },
    { reviewer_name: 'Chris Venter', rating: 4, comment: 'Great value for the price. ANC handles open-plan offices really well.' },
  ],
  // Mechanical Keyboard
  [
    { reviewer_name: 'Anna Fourie', rating: 5, comment: 'The Cherry MX Blue switches have a satisfying click. RGB lighting is vibrant and fully customisable.' },
    { reviewer_name: 'Sipho Molefe', rating: 4, comment: 'Solid build quality and the TKL form factor saves a lot of desk space. Key feel is excellent.' },
    { reviewer_name: 'Rachel Kim', rating: 5, comment: 'Typing on this keyboard feels amazing. USB-C connection is a welcome modern touch.' },
    { reviewer_name: 'Tom Ndlovu', rating: 3, comment: 'Great keyboard but the Blue switches are quite loud in a quiet office. Consider Browns for shared spaces.' },
  ],
  // 27" 4K Monitor
  [
    { reviewer_name: 'Priya Sharma', rating: 5, comment: 'Stunning colour accuracy. The 99% sRGB is not marketing fluff — my photo edits look perfect.' },
    { reviewer_name: 'Luke van der Berg', rating: 4, comment: 'Crisp 4K image. USB-C power delivery means one cable for my laptop. Bezel could be thinner.' },
    { reviewer_name: 'Michelle Osei', rating: 5, comment: 'Worth every cent. IPS panel colours are gorgeous and the stand is rock solid.' },
    { reviewer_name: 'Nico Botha', rating: 4, comment: 'Excellent monitor for development work. Text is razor-sharp at native resolution.' },
    { reviewer_name: 'Fatima Al-Hassan', rating: 3, comment: 'Good display but 60Hz feels limiting for fast-paced games. Perfect for productivity though.' },
  ],
  // 7-Port USB Hub
  [
    { reviewer_name: 'Brendan Louw', rating: 4, comment: 'Individual power switches per port are a lifesaver. Powered so no issues with demanding peripherals.' },
    { reviewer_name: 'Yuki Tanaka', rating: 5, comment: 'Exactly what my desk setup needed. USB 3.0 speeds are reliable and the LED indicators are handy.' },
    { reviewer_name: 'Sandra Mthembu', rating: 4, comment: 'Well built and the power adapter is included. Handles 7 devices with no overheating.' },
    { reviewer_name: 'Dylan Steyn', rating: 3, comment: 'Does the job fine. Power brick is a bit bulky but that is expected for a powered hub.' },
  ],
  // 1080p Webcam
  [
    { reviewer_name: 'Kemi Adeyemi', rating: 5, comment: 'Plug and play — no drivers needed. Autofocus is fast and the image is sharp for video calls.' },
    { reviewer_name: 'Pierre du Plessis', rating: 4, comment: 'Great picture quality. Built-in stereo mic picks up voice clearly without too much background noise.' },
    { reviewer_name: 'Amara Diallo', rating: 4, comment: 'Solid webcam for remote work. Low-light performance is better than I expected at this price point.' },
    { reviewer_name: 'Jake Swanepoel', rating: 3, comment: 'Image quality is fine but the clip mount feels a bit flimsy on thicker monitors.' },
    { reviewer_name: 'Thandi Zulu', rating: 5, comment: 'My team immediately commented on how much clearer I looked on calls. Totally worth it.' },
  ],
  // Smart LED Desk Lamp
  [
    { reviewer_name: 'Olivia Smit', rating: 5, comment: 'The colour temperature range is perfect — warm for evenings, cool daylight for focused work.' },
    { reviewer_name: 'Carlos Mendes', rating: 4, comment: 'Touch controls are responsive and the memory function saves my favourite settings. USB charging port is a bonus.' },
    { reviewer_name: 'Nomsa Khumalo', rating: 4, comment: 'Sleek design that fits any desk. Bright enough even at lower settings. Very happy with this purchase.' },
    { reviewer_name: 'Ben Pretorius', rating: 3, comment: 'Nice lamp but the touch sensor sometimes triggers accidentally. Otherwise good quality.' },
  ],
  // Ergonomic Office Chair
  [
    { reviewer_name: 'Hana Kowalski', rating: 5, comment: 'My back pain disappeared after switching to this chair. Lumbar support is highly adjustable and effective.' },
    { reviewer_name: 'Musa Cele', rating: 4, comment: 'Very comfortable for long coding sessions. The mesh back keeps things cool. Assembly took about 30 minutes.' },
    { reviewer_name: 'Ingrid van Wyk', rating: 5, comment: 'Premium build quality. The 4D armrests make a huge difference for reducing shoulder strain.' },
    { reviewer_name: 'Raj Govender', rating: 4, comment: 'Worth the investment. My posture has improved noticeably. Seat cushion is firm but supportive.' },
    { reviewer_name: 'Chloe Barnard', rating: 3, comment: 'Comfortable chair but the height adjustment lever requires quite a bit of force to operate.' },
  ],
  // Height-Adjustable Standing Desk
  [
    { reviewer_name: 'Marcus De Beer', rating: 5, comment: 'Game changer for my health. Memory presets mean I switch between sitting and standing in seconds.' },
    { reviewer_name: 'Elena Mokoena', rating: 4, comment: 'Sturdy construction with no wobble even at maximum height. Cable management tray is very useful.' },
    { reviewer_name: 'Trevor Jacobs', rating: 5, comment: 'The anti-collision feature saved my monitors twice already. Motors are whisper-quiet.' },
    { reviewer_name: 'Aisha Balogun', rating: 4, comment: 'Great desk. Delivery required some assembly but it is straightforward. Highly recommend going standing.' },
  ],
  // Aluminium Laptop Stand
  [
    { reviewer_name: 'Stefan Dreyer', rating: 5, comment: 'Solid aluminium with zero flex. Keeps my laptop at a perfect eye level. Folds flat for travel.' },
    { reviewer_name: 'Grace Mahlangu', rating: 4, comment: 'Elegant design and the non-slip base keeps it firmly on my desk. Ventilation holes prevent overheating.' },
    { reviewer_name: 'Liam O\'Brien', rating: 4, comment: 'Great quality for the price. The angle is comfortable for long work sessions.' },
    { reviewer_name: 'Zanele Sithole', rating: 5, comment: 'Highly adjustable and very stable. Looks premium on my desk setup.' },
  ],
  // Cable Management Kit
  [
    { reviewer_name: 'Felix Roux', rating: 4, comment: 'Finally got my desk cables under control. The velcro ties are reusable and the clips hold firmly.' },
    { reviewer_name: 'Puleng Radebe', rating: 5, comment: 'Comprehensive kit with everything you need. The adhesive mounts stick well and do not leave residue.' },
    { reviewer_name: 'Amy Joubert', rating: 3, comment: 'Good value for money. Some of the smaller clips are a bit fiddly to use but they do the job.' },
    { reviewer_name: 'Kwame Asante', rating: 4, comment: 'Transformed my messy desk. Cable sleeves are particularly useful for bundling monitor cables.' },
    { reviewer_name: 'Bianca Ferreira', rating: 5, comment: 'Every piece in this kit is useful. My desk has never looked this clean. Worth it.' },
  ],
]

const seed = async (): Promise<void> => {
  console.log('Seeding database...')
  await prisma.review.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()

  for (let i = 0; i < products.length; i++) {
    const product = await prisma.product.create({ data: products[i]! })
    const reviews = reviewsByProduct[i] ?? []
    for (const review of reviews) {
      await prisma.review.create({ data: { product_id: product.id, ...review } })
    }
  }

  console.log(`Seeded ${products.length} products with reviews`)
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => void prisma.$disconnect())
