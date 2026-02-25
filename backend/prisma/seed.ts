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

// 4–5 reviews per product, spread of 3–5 stars, realistic comments per category
const reviewTemplates: Record<string, { reviewer_name: string; rating: number; comment: string }[]> = {
  'Wireless Noise-Cancelling Headphones': [
    { reviewer_name: 'Thabo M.', rating: 5, comment: 'Best headphones I have ever owned. The ANC is incredible — I can work in a noisy open-plan office without being distracted.' },
    { reviewer_name: 'Priya S.', rating: 5, comment: 'Sound quality is phenomenal and the 30-hour battery means I only charge once a week. Highly recommend.' },
    { reviewer_name: 'James O.', rating: 4, comment: 'Great ANC and comfortable for long sessions. Wish the bass was slightly punchier, but overall excellent.' },
    { reviewer_name: 'Lindiwe N.', rating: 4, comment: 'The foldable design is perfect for travel. Build quality feels premium. Paid every cent.' },
    { reviewer_name: 'Ruan B.', rating: 3, comment: 'Good headphones but the ear cushions get warm after an hour. ANC works well though.' },
  ],
  'Mechanical Keyboard': [
    { reviewer_name: 'Keegan T.', rating: 5, comment: 'Cherry MX Blues are exactly what I wanted. The tactile feedback makes coding feel satisfying. RGB is a nice bonus.' },
    { reviewer_name: 'Sipho D.', rating: 5, comment: 'Excellent build quality. The TKL layout frees up desk space and the USB-C cable is convenient.' },
    { reviewer_name: 'Anouk V.', rating: 4, comment: 'Loud but I love it. The typing experience is great. My colleagues are less enthusiastic about the noise.' },
    { reviewer_name: 'Michael L.', rating: 4, comment: 'Great keyboard for the price. Would be 5 stars if it had a detachable cable.' },
  ],
  '27" 4K Monitor': [
    { reviewer_name: 'Fatima A.', rating: 5, comment: 'The 4K IPS panel is stunning. Colours are accurate out of the box — essential for my design work.' },
    { reviewer_name: 'Brendan C.', rating: 5, comment: 'USB-C power delivery is a game changer. One cable for my laptop — power and display. Crisp and bright.' },
    { reviewer_name: 'Zanele K.', rating: 4, comment: 'Beautiful display. The stand is a bit limited in range but a monitor arm fixes that easily.' },
    { reviewer_name: 'Marco F.', rating: 4, comment: '60Hz is fine for productivity. For gaming you will want something else, but for work it is superb.' },
    { reviewer_name: 'Ayesha R.', rating: 5, comment: 'Worth every rand. Text is razor-sharp and spreadsheets are so much easier to read at 4K.' },
  ],
  '7-Port USB Hub': [
    { reviewer_name: 'Dirk H.', rating: 4, comment: 'Exactly what I needed for my laptop dock setup. All 7 ports work reliably and the LED indicators are useful.' },
    { reviewer_name: 'Nandi M.', rating: 5, comment: 'Individual power switches per port is brilliant. I can turn off charging devices without unplugging. Very well made.' },
    { reviewer_name: 'Callum J.', rating: 3, comment: 'Does the job. Noticed slight slowdown when using all 7 ports simultaneously but for typical use it is fine.' },
    { reviewer_name: 'Yusra P.', rating: 4, comment: 'Solid hub. The power adapter included is a nice touch so you do not drain your laptop battery.' },
  ],
  '1080p Webcam': [
    { reviewer_name: 'Tanya W.', rating: 5, comment: 'Image quality is miles better than my laptop camera. Autofocus works smoothly during video calls. Very happy.' },
    { reviewer_name: 'Obi E.', rating: 4, comment: 'Plug and play — no drivers needed. Stereo mics pick up my voice clearly without background noise issues.' },
    { reviewer_name: 'Hanna S.', rating: 4, comment: 'Great webcam for work from home. Performs well in low light which was my main concern.' },
    { reviewer_name: 'Leon B.', rating: 3, comment: 'Decent quality for the price. The clamp mounting is a little stiff but secure once set up.' },
    { reviewer_name: 'Patience G.', rating: 5, comment: 'My team keeps complimenting my video quality since I switched. Clear image, easy setup. Recommend.' },
  ],
  'Smart LED Desk Lamp': [
    { reviewer_name: 'Charlotte N.', rating: 5, comment: 'The adjustable colour temperature is perfect — warm light in the evening and cool white during the day. Love the USB charging port.' },
    { reviewer_name: 'Anton S.', rating: 4, comment: 'Sleek design and touch controls are very responsive. The memory function remembers my preferred setting.' },
    { reviewer_name: 'Mpho L.', rating: 5, comment: 'Much better than my old lamp. No eye strain after long work sessions. The build quality is solid.' },
    { reviewer_name: 'Ingrid V.', rating: 3, comment: 'Nice lamp but the lowest brightness setting is still a bit bright for evening use. Colour temperature range is good.' },
  ],
  'Ergonomic Office Chair': [
    { reviewer_name: 'David K.', rating: 5, comment: 'My back pain has significantly reduced since switching to this chair. The lumbar support is adjustable and the 4D armrests are excellent.' },
    { reviewer_name: 'Nomsa T.', rating: 5, comment: 'Worth the investment. I sit 8+ hours a day and this is the most comfortable chair I have had. Breathable mesh is great in summer.' },
    { reviewer_name: 'Gerrit P.', rating: 4, comment: 'Solid ergonomic chair. Assembly took about 45 minutes but the result is excellent. Very adjustable.' },
    { reviewer_name: 'Ria C.', rating: 4, comment: 'Great chair but it took a week to dial in all the adjustments for my body. Now it is perfect.' },
    { reviewer_name: 'Bongani Z.', rating: 3, comment: 'Good quality but I expected better padding on the seat. Lumbar support and armrests are top notch though.' },
  ],
  'Height-Adjustable Standing Desk': [
    { reviewer_name: 'Erik H.', rating: 5, comment: 'The anti-collision feature saved my monitor twice already. Electric motor is quiet and smooth. Memory presets are great.' },
    { reviewer_name: 'Sibongile M.', rating: 5, comment: 'Best desk I have ever used. Standing for 2 hours in the morning has made a real difference to my energy levels.' },
    { reviewer_name: 'Stefan V.', rating: 4, comment: 'Well-built and stable even at max height. The cable management tray is a must-have feature. Delivery and assembly were straightforward.' },
    { reviewer_name: 'Chantal B.', rating: 4, comment: 'Excellent desk. Only minor complaint is the control panel could be more intuitive but memory presets work well once programmed.' },
  ],
  'Aluminium Laptop Stand': [
    { reviewer_name: 'Kyle M.', rating: 5, comment: 'Lightweight, adjustable, and keeps my MacBook cool. The non-slip base is essential — it has never budged.' },
    { reviewer_name: 'Taryn F.', rating: 4, comment: 'Looks great on my desk. The aluminium finish is premium and it folds down to almost nothing for my bag.' },
    { reviewer_name: 'Lebo R.', rating: 5, comment: 'Exactly what I needed for an ergonomic setup with an external keyboard. Neck strain gone. Very happy.' },
    { reviewer_name: 'Pieter J.', rating: 3, comment: 'Good stand for the price. The angle adjustment clicks are a bit coarse but it holds position reliably.' },
  ],
  'Cable Management Kit': [
    { reviewer_name: 'Sarah O.', rating: 5, comment: 'My desk looks completely transformed. The cable clips stick firmly and the velcro ties are reusable. Excellent kit.' },
    { reviewer_name: 'Dumisani N.', rating: 4, comment: 'Great value. Comes with more than enough pieces for a full desk setup. The cable sleeves are particularly useful.' },
    { reviewer_name: 'Mia W.', rating: 4, comment: 'Does exactly what it says. Adhesive mounts are strong and hold well on glass and wood desks.' },
    { reviewer_name: 'Hendrik L.', rating: 5, comment: 'Bought this for my home office makeover and it is brilliant. Everything is neat and tidy. Would buy again.' },
    { reviewer_name: 'Asha G.', rating: 3, comment: 'Good kit but a few of the smaller clips were tricky to use. Overall a solid product for the price.' },
  ],
}

const seed = async (): Promise<void> => {
  console.log('Seeding database...')
  await prisma.review.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()

  for (const product of products) {
    const created = await prisma.product.create({ data: product })
    const reviews = reviewTemplates[product.name]
    if (reviews) {
      for (const review of reviews) {
        await prisma.review.create({
          data: { product_id: created.id, ...review },
        })
      }
    }
  }

  console.log(`Seeded ${products.length} products with reviews`)
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => void prisma.$disconnect())
