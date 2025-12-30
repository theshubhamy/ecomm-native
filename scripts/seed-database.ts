import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('\n📝 To seed the database, you need:');
  console.error('   1. EXPO_PUBLIC_SUPABASE_URL (your Supabase project URL)');
  console.error('   2. SUPABASE_SERVICE_ROLE_KEY (NOT the anon key!)');
  console.error('\n🔑 Get your Service Role Key:');
  console.error('   Supabase Dashboard → Settings → API → service_role key');
  console.error('\n💡 Alternative: Use the SQL seed script instead:');
  console.error('   Run scripts/sql/seed.sql in Supabase SQL Editor');
  console.error('   SQL scripts bypass RLS automatically\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample Categories - Comprehensive list for quick commerce
const categories = [
  {
    id: 'cat-1',
    name: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
    description: 'Fresh fruits and vegetables',
  },
  {
    id: 'cat-2',
    name: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    description: 'Fresh dairy products and eggs',
  },
  {
    id: 'cat-3',
    name: 'Beverages',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    description: 'Drinks and beverages',
  },
  {
    id: 'cat-4',
    name: 'Snacks',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
    description: 'Snacks and munchies',
  },
  {
    id: 'cat-5',
    name: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    description: 'Fresh baked goods',
  },
  {
    id: 'cat-6',
    name: 'Meat & Seafood',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400',
    description: 'Fresh meat and seafood',
  },
  {
    id: 'cat-7',
    name: 'Grocery & Kitchen',
    image: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400',
    description: 'Kitchen essentials and groceries',
  },
  {
    id: 'cat-8',
    name: 'Beauty & Personal Care',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    description: 'Beauty products and personal care items',
  },
  {
    id: 'cat-9',
    name: 'Household Essentials',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    description: 'Household cleaning and essentials',
  },
  {
    id: 'cat-10',
    name: 'Baby Care',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0d4d24e?w=400',
    description: 'Baby products and care items',
  },
  {
    id: 'cat-11',
    name: 'Health & Pharma',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    description: 'Health supplements and medicines',
  },
  {
    id: 'cat-12',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
    description: 'Electronics and gadgets',
  },
  {
    id: 'cat-13',
    name: 'Fashion & Clothing',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    description: 'Fashion and clothing items',
  },
  {
    id: 'cat-14',
    name: 'Sports & Fitness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    description: 'Sports equipment and fitness gear',
  },
  {
    id: 'cat-15',
    name: 'Books & Stationery',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    description: 'Books and stationery items',
  },
];

// Sample Products
const products = [
  // Fruits & Vegetables
  {
    name: 'Fresh Apples',
    image_url:
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    price: 250, // INR
    description: 'Crisp and juicy red apples',
    category_id: 'cat-1',
    in_stock: true,
    rating: 4.5,
  },
  {
    name: 'Organic Bananas',
    image_url:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    price: 80, // INR
    description: 'Fresh organic bananas',
    category_id: 'cat-1',
    in_stock: true,
    rating: 4.7,
  },
  {
    name: 'Fresh Tomatoes',
    image_url:
      'https://images.unsplash.com/photo-1546095667-0c3c7e0e3c3e?w=400',
    price: 60, // INR
    description: 'Ripe red tomatoes',
    category_id: 'cat-1',
    in_stock: true,
    rating: 4.3,
  },
  {
    name: 'Fresh Carrots',
    image_url:
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
    price: 50, // INR
    description: 'Fresh orange carrots',
    category_id: 'cat-1',
    in_stock: true,
    rating: 4.6,
  },
  // Dairy & Eggs
  {
    name: 'Fresh Milk',
    image_url:
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    price: 66, // INR per liter
    description: 'Whole milk, 1 liter',
    category_id: 'cat-2',
    in_stock: true,
    rating: 4.8,
  },
  {
    name: 'Free Range Eggs',
    image_url:
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    price: 120, // INR
    description: 'Dozen free range eggs',
    category_id: 'cat-2',
    in_stock: true,
    rating: 4.9,
  },
  {
    name: 'Greek Yogurt',
    image_url:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    price: 150, // INR
    description: 'Creamy Greek yogurt',
    category_id: 'cat-2',
    in_stock: true,
    rating: 4.7,
  },
  // Beverages
  {
    name: 'Orange Juice',
    image_url:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    price: 120, // INR
    description: 'Fresh squeezed orange juice',
    category_id: 'cat-3',
    in_stock: true,
    rating: 4.5,
  },
  {
    name: 'Coffee Beans',
    image_url:
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    price: 450, // INR
    description: 'Premium coffee beans',
    category_id: 'cat-3',
    in_stock: true,
    rating: 4.8,
  },
  {
    name: 'Green Tea',
    image_url:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    price: 180, // INR
    description: 'Organic green tea',
    category_id: 'cat-3',
    in_stock: true,
    rating: 4.6,
  },
  // Snacks
  {
    name: 'Potato Chips',
    image_url:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    price: 20, // INR
    description: 'Crispy potato chips',
    category_id: 'cat-4',
    in_stock: true,
    rating: 4.4,
  },
  {
    name: 'Chocolate Cookies',
    image_url:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    price: 150, // INR
    description: 'Delicious chocolate cookies',
    category_id: 'cat-4',
    in_stock: true,
    rating: 4.7,
  },
  // Bakery
  {
    name: 'Fresh Bread',
    image_url:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    price: 45, // INR
    description: 'Freshly baked bread',
    category_id: 'cat-5',
    in_stock: true,
    rating: 4.6,
  },
  {
    name: 'Croissants',
    image_url:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    price: 80, // INR
    description: 'Buttery croissants',
    category_id: 'cat-5',
    in_stock: true,
    rating: 4.8,
  },
  // Meat & Seafood
  {
    name: 'Chicken Breast',
    image_url:
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
    price: 350, // INR per kg
    description: 'Fresh chicken breast',
    category_id: 'cat-6',
    in_stock: true,
    rating: 4.5,
  },
  {
    name: 'Salmon Fillet',
    image_url:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    price: 1200, // INR per kg
    description: 'Fresh salmon fillet',
    category_id: 'cat-6',
    in_stock: true,
    rating: 4.9,
  },
];

// Sample Offers
const offers = [
  {
    promo_code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 20,
    max_discount: 10,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    is_active: true,
    title: 'Welcome Offer',
    description: 'Get 10% off on your first order',
  },
  {
    promo_code: 'FLASH50',
    discount_type: 'percentage',
    discount_value: 50,
    min_order_amount: 50,
    max_discount: 25,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    is_active: true,
    title: 'Flash Sale',
    description: '50% off on orders above $50',
  },
  {
    promo_code: 'FREESHIP',
    discount_type: 'fixed',
    discount_value: 5,
    min_order_amount: 30,
    max_discount: 5,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    is_active: true,
    title: 'Free Shipping',
    description: 'Free shipping on orders above $30',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if tables exist first
    console.log('🔍 Checking if tables exist...');
    const { error: tableCheckError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.code === 'PGRST205') {
      console.error('\n❌ Tables do not exist yet!');
      console.error('Please create the database schema first:');
      console.error('1. Go to Supabase Dashboard → SQL Editor');
      console.error('2. Copy and run: scripts/sql/schema.sql');
      console.error('3. Then run this seed script again\n');
      process.exit(1);
    }

    // 1. Seed Categories
    console.log('📦 Seeding categories...');
    const { data: existingCategories, error: categoriesCheckError } =
      await supabase.from('categories').select('id');

    if (categoriesCheckError && categoriesCheckError.code !== 'PGRST116') {
      throw categoriesCheckError;
    }

    const existingCategoryIds = new Set(
      existingCategories?.map(c => c.id) || [],
    );

    // Separate categories into new and existing
    const categoriesToInsert = categories.filter(
      cat => !existingCategoryIds.has(cat.id),
    );
    const categoriesToUpdate = categories.filter(cat =>
      existingCategoryIds.has(cat.id),
    );

    // Insert new categories
    if (categoriesToInsert.length > 0) {
      const { error: categoriesError } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (categoriesError) {
        console.error('❌ Error seeding categories:', categoriesError);
      } else {
        console.log(`✅ Inserted ${categoriesToInsert.length} new categories`);
      }
    }

    // Update existing categories
    if (categoriesToUpdate.length > 0) {
      let updatedCount = 0;
      for (const category of categoriesToUpdate) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            name: category.name,
            image: category.image,
            description: category.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', category.id);

        if (updateError) {
          console.error(
            `❌ Error updating category ${category.id}:`,
            updateError,
          );
        } else {
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        console.log(`✅ Updated ${updatedCount} existing categories`);
      }
    }

    if (categoriesToInsert.length === 0 && categoriesToUpdate.length === 0) {
      console.log('✅ All categories are up to date');
    }

    // 2. Seed Products
    console.log('\n🛍️  Seeding products...');
    const { data: existingProducts, error: productsCheckError } = await supabase
      .from('products')
      .select('name');

    if (productsCheckError && productsCheckError.code !== 'PGRST116') {
      throw productsCheckError;
    }

    const existingProductNames = new Set(
      existingProducts?.map(p => p.name) || [],
    );

    const productsToInsert = products.filter(
      p => !existingProductNames.has(p.name),
    );

    if (productsToInsert.length > 0) {
      const { error: productsError } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (productsError) {
        console.error('❌ Error seeding products:', productsError);
      } else {
        console.log(`✅ Inserted ${productsToInsert.length} products`);
      }
    } else {
      console.log('✅ Products already exist, skipping...');
    }

    // 3. Seed Offers
    console.log('\n🎁 Seeding offers...');
    const { data: existingOffers, error: offersCheckError } = await supabase
      .from('offers')
      .select('promo_code');

    if (offersCheckError && offersCheckError.code !== 'PGRST116') {
      throw offersCheckError;
    }

    const existingPromoCodes = new Set(
      existingOffers?.map(o => o.promo_code) || [],
    );

    const offersToInsert = offers.filter(
      o => !existingPromoCodes.has(o.promo_code),
    );

    if (offersToInsert.length > 0) {
      const { error: offersError } = await supabase
        .from('offers')
        .insert(offersToInsert);

      if (offersError) {
        console.error('❌ Error seeding offers:', offersError);
      } else {
        console.log(`✅ Inserted ${offersToInsert.length} offers`);
      }
    } else {
      console.log('✅ Offers already exist, skipping...');
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Offers: ${offers.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();
