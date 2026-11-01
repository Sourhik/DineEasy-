const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const AdminSettings = require('../models/AdminSettings');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Reservation.deleteMany({}),
      Notification.deleteMany({}),
      AdminSettings.deleteMany({}),
    ]);

    console.log('Creating Admin Settings...');
    await AdminSettings.create({
      platformName: 'DineEasy',
      supportEmail: 'support@dineeasy.com',
      supportPhone: '+1 (800) 555-DINE',
      autoApproveRestaurants: false,
      cancellationWindowHours: 2,
    });

    console.log('Creating Super Admin user...');
    const adminUser = await User.create({
      name: 'System Super Admin',
      email: 'admin@dineeasy.com',
      password: 'admin123',
      phone: '+1 555-0100',
      role: 'admin',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });

    console.log('Creating Customers...');
    const customerJohn = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'customer123',
      phone: '+1 555-0211',
      role: 'customer',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    const customerSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      password: 'customer123',
      phone: '+1 555-0222',
      role: 'customer',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    });

    console.log('Creating Restaurant Owners & Restaurants...');
    // Restaurant 1: The Royal Saffron (Managed by Rajesh Mehra)
    const ownerSaffron = await User.create({
      name: 'Chef Rajesh Mehra',
      email: 'saffron@dineeasy.com',
      password: 'saffron123',
      phone: '+1 555-0311',
      role: 'restaurant_owner',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
    });

    const restaurantSaffron = await Restaurant.create({
      name: 'The Royal Saffron',
      restaurantCode: 'REST001',
      ownerId: ownerSaffron._id,
      email: 'saffron@dineeasy.com',
      phone: '+1 555-0312',
      address: '450 Grand Avenue, Downtown',
      city: 'Metropolis',
      description: 'Award-winning authentic Mughlai and contemporary Indian culinary artistry served in an opulent imperial ambiance with rich gold details and heritage recipes.',
      cuisine: ['Indian', 'Mughlai', 'Fine Dining'],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      openingHours: '12:00 PM - 11:30 PM',
      priceRange: '$$$',
      rating: 4.9,
      totalTables: 12,
      status: 'active',
    });

    // Restaurant 2: Spice Garden (Also managed by Rajesh Mehra for Multi-Restaurant switching)
    const restaurantSpiceGarden = await Restaurant.create({
      name: 'Spice Garden',
      restaurantCode: 'REST002',
      ownerId: ownerSaffron._id,
      email: 'spicegarden@dineeasy.com',
      phone: '+1 555-0322',
      address: '122 Green Valley Road, Uptown Garden District',
      city: 'Metropolis',
      description: 'Lush botanical garden setting with vibrant organic North & South Indian dishes, fresh herb-infused curries, and botanical mocktails.',
      cuisine: ['Indian', 'Vegetarian & Vegan', 'Organic'],
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
      openingHours: '11:00 AM - 10:30 PM',
      priceRange: '$$',
      rating: 4.8,
      totalTables: 12,
      status: 'active',
    });

    ownerSaffron.restaurantId = restaurantSaffron._id;
    ownerSaffron.assignedRestaurants = [restaurantSaffron._id, restaurantSpiceGarden._id];
    await ownerSaffron.save();

    // Restaurant 3: L'Osteria Bella
    const ownerBella = await User.create({
      name: 'Chef Marco Rossi',
      email: 'osteria@dineeasy.com',
      password: 'osteria123',
      phone: '+1 555-0411',
      role: 'restaurant_owner',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=300&q=80',
    });

    const restaurantBella = await Restaurant.create({
      name: "L'Osteria Bella",
      restaurantCode: 'REST003',
      ownerId: ownerBella._id,
      email: 'osteria@dineeasy.com',
      phone: '+1 555-0412',
      address: '782 Via Bella Piazza, Arts District',
      city: 'Metropolis',
      description: 'Handcrafted authentic Tuscan pastas, 72-hour fermented wood-fired Neapolitan pizzas, and exquisite wine pairings in a warm candlelit rustic courtyard.',
      cuisine: ['Italian', 'Mediterranean', 'Wood-fired Pizza'],
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=300&q=80',
      openingHours: '11:30 AM - 11:00 PM',
      priceRange: '$$',
      rating: 4.8,
      totalTables: 14,
      status: 'active',
    });
    ownerBella.restaurantId = restaurantBella._id;
    ownerBella.assignedRestaurants = [restaurantBella._id];
    await ownerBella.save();

    // Restaurant 4: Sakura Japanese Bistro
    const ownerSakura = await User.create({
      name: 'Kenji Takahashi',
      email: 'sakura@dineeasy.com',
      password: 'sakura123',
      phone: '+1 555-0511',
      role: 'restaurant_owner',
      status: 'active',
    });

    const restaurantSakura = await Restaurant.create({
      name: 'Sakura Japanese Bistro',
      restaurantCode: 'REST004',
      ownerId: ownerSakura._id,
      email: 'sakura@dineeasy.com',
      phone: '+1 555-0512',
      address: '108 Harbor Way, Waterfront',
      city: 'Metropolis',
      description: 'Omakase experience featuring fresh Tokyo fish flown in daily, A5 Wagyu robata skewers, signature sushi rolls, and rare artisanal sakes.',
      cuisine: ['Japanese', 'Sushi', 'Robata'],
      image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=300&q=80',
      openingHours: '05:00 PM - 11:30 PM',
      priceRange: '$$$$',
      rating: 4.9,
      totalTables: 10,
      status: 'active',
    });
    ownerSakura.restaurantId = restaurantSakura._id;
    ownerSakura.assignedRestaurants = [restaurantSakura._id];
    await ownerSakura.save();

    // Restaurant 5: Le Petit Bistro
    const ownerPetit = await User.create({
      name: 'Antoine Laurent',
      email: 'petit@dineeasy.com',
      password: 'petit123',
      phone: '+1 555-0611',
      role: 'restaurant_owner',
      status: 'active',
    });

    const restaurantPetit = await Restaurant.create({
      name: 'Le Petit Bistro',
      restaurantCode: 'REST005',
      ownerId: ownerPetit._id,
      email: 'petit@dineeasy.com',
      phone: '+1 555-0612',
      address: '22 Boulevard St. Michel, Uptown',
      city: 'Metropolis',
      description: 'Parisian chic brasserie offering timeless French gastronomic classics like Slow-Braised Duck Confit, Beef Bourguignon, and fresh baguettes.',
      cuisine: ['French', 'Contemporary', 'Steakhouse'],
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
      openingHours: '12:00 PM - 10:30 PM',
      priceRange: '$$$',
      rating: 4.7,
      totalTables: 10,
      status: 'active',
    });
    ownerPetit.restaurantId = restaurantPetit._id;
    ownerPetit.assignedRestaurants = [restaurantPetit._id];
    await ownerPetit.save();

    // Create Tables for The Royal Saffron
    console.log('Creating Tables...');
    const saffronTables = [
      { tableNumber: 'T-1', capacity: 2, location: 'indoor' },
      { tableNumber: 'T-2', capacity: 2, location: 'indoor' },
      { tableNumber: 'T-3', capacity: 4, location: 'indoor' },
      { tableNumber: 'T-4', capacity: 4, location: 'indoor' },
      { tableNumber: 'T-5', capacity: 6, location: 'terrace' },
      { tableNumber: 'T-6', capacity: 6, location: 'terrace' },
      { tableNumber: 'T-7', capacity: 8, location: 'private_dining' },
      { tableNumber: 'T-8', capacity: 8, location: 'private_dining' },
    ];
    for (const t of saffronTables) {
      await Table.create({ ...t, restaurantId: restaurantSaffron._id });
    }

    // Tables for L'Osteria Bella
    const bellaTables = [
      { tableNumber: 'B-1', capacity: 2, location: 'indoor' },
      { tableNumber: 'B-2', capacity: 2, location: 'indoor' },
      { tableNumber: 'B-3', capacity: 4, location: 'outdoor' },
      { tableNumber: 'B-4', capacity: 4, location: 'outdoor' },
      { tableNumber: 'B-5', capacity: 6, location: 'terrace' },
    ];
    for (const t of bellaTables) {
      await Table.create({ ...t, restaurantId: restaurantBella._id });
    }

    // Tables for Spice Garden
    const spiceTables = [
      { tableNumber: 'SG-1', capacity: 2, location: 'indoor' },
      { tableNumber: 'SG-2', capacity: 4, location: 'terrace' },
      { tableNumber: 'SG-3', capacity: 4, location: 'outdoor' },
      { tableNumber: 'SG-4', capacity: 6, location: 'terrace' },
    ];
    for (const t of spiceTables) {
      await Table.create({ ...t, restaurantId: restaurantSpiceGarden._id });
    }

    // Create Menu Items for The Royal Saffron
    console.log('Creating Menu Items for The Royal Saffron...');
    const saffronMenu = [
      {
        restaurantId: restaurantSaffron._id,
        name: 'Truffle Malai Paneer Tikka',
        description: 'Smoked cottage cheese infused with black truffle oil, cardamom, and toasted almond crust.',
        category: 'Starters',
        price: 18.5,
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSaffron._id,
        name: 'Melt-in-Mouth Galouti Kebab',
        description: 'Finely minced lamb kebabs spiced with 32 rare Awadhi herbs, served on saffron sheermal.',
        category: 'Starters',
        price: 22.0,
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        dietary: 'non-veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSaffron._id,
        name: 'Crispy Samosa Chaat Royale',
        description: 'Crisp pastry filled with spiced potatoes, topped with sweet yogurt, tangy tamarind, and pomegranate.',
        category: 'Starters',
        price: 14.0,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSaffron._id,
        name: 'Grand Butter Chicken 1947',
        description: 'Tandoor-charred chicken simmered in rich velvety tomato gravy with cultured white butter & fenugreek.',
        category: 'Main Course',
        price: 26.5,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
        dietary: 'non-veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSaffron._id,
        name: 'Dal Bukhara Overnight Simmered',
        description: 'Black lentils slow-cooked for 36 hours over clay charcoal oven with cream, butter, and sun-dried tomatoes.',
        category: 'Main Course',
        price: 21.0,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSaffron._id,
        name: 'Dum Biryani with Royal Spices',
        description: 'Fragrant aged Basmati rice layered with tender meat, Kashmiri saffron, fried onions, and fresh mint.',
        category: 'Main Course',
        price: 28.0,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        dietary: 'non-veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSaffron._id,
        name: 'Golden Saffron Rabri Gulab Jamun',
        description: 'Warm cottage cheese dumplings infused with rose petal syrup, topped with thick condensed saffron rabri.',
        category: 'Desserts',
        price: 13.0,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSaffron._id,
        name: 'Artisanal Saffron Mango Lassi',
        description: 'Churned organic Greek yogurt flavored with Alphonso mango pulp, crushed pistachios, and saffron strands.',
        category: 'Drinks',
        price: 9.0,
        image: 'https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
    ];

    const insertedSaffronMenu = await MenuItem.insertMany(saffronMenu);

    // Create Menu Items for L'Osteria Bella
    console.log("Creating Menu Items for L'Osteria Bella...");
    const bellaMenu = [
      {
        restaurantId: restaurantBella._id,
        name: 'Burrata Pugliese con Fichi',
        description: 'Imported fresh burrata, caramelized Mission figs, 24-month prosciutto di Parma, and aged balsamic glaze.',
        category: 'Starters',
        price: 19.0,
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
        dietary: 'non-veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantBella._id,
        name: 'Bruschetta al Pomodoro & Basilico',
        description: 'Grilled country sourdough bread with heirloom cherry tomatoes, garlic, extra virgin olive oil, and fresh basil.',
        category: 'Starters',
        price: 14.5,
        image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantBella._id,
        name: 'Tagliolini al Tartufo Nero',
        description: 'House-made fresh egg ribbon pasta tossed in Normandy butter sauce and shaved black winter truffles.',
        category: 'Main Course',
        price: 32.0,
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281165?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantBella._id,
        name: 'Pizza Margherita Verace D.O.P.',
        description: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil wood-fired at 900°F.',
        category: 'Main Course',
        price: 23.0,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantBella._id,
        name: 'Traditional Venetian Tiramisu',
        description: 'Layers of espresso-soaked Savoiardi ladyfingers, velvety mascarpone cream, and dark cocoa dust.',
        category: 'Desserts',
        price: 12.0,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantBella._id,
        name: 'Classic Aperol Spritz',
        description: 'Aperol liqueur, Valdobbiadene Prosecco Superiore, splash of club soda, garnished with fresh orange wheel.',
        category: 'Drinks',
        price: 14.0,
        image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
    ];
    await MenuItem.insertMany(bellaMenu);

    // Create Menu Items for Spice Garden
    console.log('Creating Menu Items for Spice Garden...');
    const spiceMenu = [
      {
        restaurantId: restaurantSpiceGarden._id,
        name: 'Avocado Tandoori Chaat',
        description: 'Hass avocado roasted in clay oven, topped with pomegranate molasses and fresh cilantro mint chutney.',
        category: 'Starters',
        price: 16.0,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        dietary: 'vegan',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSpiceGarden._id,
        name: 'Crispy Lotus Stem Honey Chilli',
        description: 'Sliced lotus root crisped golden and glazed with organic wildflower honey, toasted sesame, and scallions.',
        category: 'Starters',
        price: 15.0,
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSpiceGarden._id,
        name: 'Garden Herb Paneer Makhani',
        description: 'Farm-fresh organic cottage cheese cubes simmered in velvety fenugreek and plum tomato reduction.',
        category: 'Main Course',
        price: 24.0,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSpiceGarden._id,
        name: 'Wild Mushroom Dum Biryani',
        description: 'Slow-steamed aged basmati rice with morels, chanterelles, saffron infusion, and caramelized leeks.',
        category: 'Main Course',
        price: 25.0,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSpiceGarden._id,
        name: 'Cardamom Saffron Kheer Tart',
        description: 'Delicate almond pastry crust filled with slow-churned condensed milk pudding and roasted pistachios.',
        category: 'Desserts',
        price: 12.0,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        dietary: 'veg',
        isAvailable: true,
        isPublished: true,
      },
      {
        restaurantId: restaurantSpiceGarden._id,
        name: 'Hibiscus Mint Botanical Spritz',
        description: 'Cold-steeped organic hibiscus flower infusion, garden spearmint, lime elixir, and sparkling water.',
        category: 'Drinks',
        price: 8.5,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        dietary: 'vegan',
        isAvailable: true,
        isPublished: true,
      },
    ];
    const insertedSpiceMenu = await MenuItem.insertMany(spiceMenu);

    // Create Initial Reservations
    console.log('Creating Initial Reservations...');
    const today = new Date().toISOString().split('T')[0];

    // Reservation 1: Confirmed with Food Pre-Order
    const res1 = await Reservation.create({
      bookingId: 'DE-2026-X8801',
      customerId: customerJohn._id,
      restaurantId: restaurantSaffron._id,
      customerName: customerJohn.name,
      customerEmail: customerJohn.email,
      customerPhone: customerJohn.phone,
      date: today,
      timeSlot: '07:30 PM',
      guestsCount: 4,
      tableNumber: 'Table #T-3',
      menuPreference: 'YES',
      selectedItems: [
        {
          menuItemId: insertedSaffronMenu[0]._id,
          name: insertedSaffronMenu[0].name,
          price: insertedSaffronMenu[0].price,
          quantity: 2,
          category: insertedSaffronMenu[0].category,
          image: insertedSaffronMenu[0].image,
        },
        {
          menuItemId: insertedSaffronMenu[3]._id,
          name: insertedSaffronMenu[3].name,
          price: insertedSaffronMenu[3].price,
          quantity: 2,
          category: insertedSaffronMenu[3].category,
          image: insertedSaffronMenu[3].image,
        },
        {
          menuItemId: insertedSaffronMenu[6]._id,
          name: insertedSaffronMenu[6].name,
          price: insertedSaffronMenu[6].price,
          quantity: 4,
          category: insertedSaffronMenu[6].category,
          image: insertedSaffronMenu[6].image,
        },
      ],
      estimatedFoodTotal: 142.0,
      status: 'confirmed',
      specialRequests: 'Anniversary celebration. Window seating preferred.',
    });

    // Reservation 2: Pending (Ready for Restaurant Owner to Accept/Reject)
    const res2 = await Reservation.create({
      bookingId: 'DE-2026-P9204',
      customerId: customerSarah._id,
      restaurantId: restaurantSaffron._id,
      customerName: customerSarah.name,
      customerEmail: customerSarah.email,
      customerPhone: customerSarah.phone,
      date: today,
      timeSlot: '08:30 PM',
      guestsCount: 2,
      tableNumber: 'Table Assigned on Arrival',
      menuPreference: 'NO',
      selectedItems: [],
      estimatedFoodTotal: 0,
      status: 'pending',
      specialRequests: 'Quiet corner table please.',
    });

    // Reservation 3: Confirmed at Bella
    const res3 = await Reservation.create({
      bookingId: 'DE-2026-B1042',
      customerId: customerJohn._id,
      restaurantId: restaurantBella._id,
      customerName: customerJohn.name,
      customerEmail: customerJohn.email,
      customerPhone: customerJohn.phone,
      date: today,
      timeSlot: '01:00 PM',
      guestsCount: 2,
      tableNumber: 'Table #B-1',
      menuPreference: 'NO',
      selectedItems: [],
      estimatedFoodTotal: 0,
      status: 'confirmed',
    });

    // Reservation 4: Pending at Spice Garden (Ready for manager testing)
    const resSG1 = await Reservation.create({
      bookingId: 'DE-2026-SG701',
      customerId: customerSarah._id,
      restaurantId: restaurantSpiceGarden._id,
      customerName: customerSarah.name,
      customerEmail: customerSarah.email,
      customerPhone: customerSarah.phone,
      date: today,
      timeSlot: '07:00 PM',
      guestsCount: 2,
      tableNumber: 'Table #SG-2',
      menuPreference: 'YES',
      selectedItems: [
        {
          menuItemId: insertedSpiceMenu[0]._id,
          name: insertedSpiceMenu[0].name,
          price: insertedSpiceMenu[0].price,
          quantity: 1,
          category: insertedSpiceMenu[0].category,
          image: insertedSpiceMenu[0].image,
        },
        {
          menuItemId: insertedSpiceMenu[2]._id,
          name: insertedSpiceMenu[2].name,
          price: insertedSpiceMenu[2].price,
          quantity: 1,
          category: insertedSpiceMenu[2].category,
          image: insertedSpiceMenu[2].image,
        },
        {
          menuItemId: insertedSpiceMenu[5]._id,
          name: insertedSpiceMenu[5].name,
          price: insertedSpiceMenu[5].price,
          quantity: 2,
          category: insertedSpiceMenu[5].category,
          image: insertedSpiceMenu[5].image,
        },
      ],
      estimatedFoodTotal: 57.0,
      status: 'pending',
      specialRequests: 'Outdoor garden seating requested.',
    });

    // Reservation 5: Confirmed at Spice Garden
    const resSG2 = await Reservation.create({
      bookingId: 'DE-2026-SG702',
      customerId: customerJohn._id,
      restaurantId: restaurantSpiceGarden._id,
      customerName: customerJohn.name,
      customerEmail: customerJohn.email,
      customerPhone: customerJohn.phone,
      date: today,
      timeSlot: '08:30 PM',
      guestsCount: 4,
      tableNumber: 'Table #SG-4',
      menuPreference: 'NO',
      selectedItems: [],
      estimatedFoodTotal: 0,
      status: 'confirmed',
    });

    console.log('Creating Notifications...');
    await Notification.create({
      recipientRole: 'restaurant_owner',
      restaurantId: restaurantSaffron._id,
      title: 'New Table Reservation Received!',
      message: `Sarah Jenkins requested a table for 2 guests today at 08:30 PM (Booking ID: ${res2.bookingId}).`,
      type: 'new_booking',
      reservationId: res2._id,
      isRead: false,
    });

    await Notification.create({
      recipientRole: 'restaurant_owner',
      restaurantId: restaurantSpiceGarden._id,
      title: 'New Reservation at Spice Garden!',
      message: `Sarah Jenkins booked a garden table for 2 guests today at 07:00 PM (${resSG1.bookingId}).`,
      type: 'new_booking',
      reservationId: resSG1._id,
      isRead: false,
    });

    await Notification.create({
      recipientRole: 'super_admin',
      title: 'New Table Booking',
      message: `Sarah Jenkins booked a table at The Royal Saffron (${res2.bookingId}).`,
      type: 'new_booking',
      reservationId: res2._id,
      isRead: false,
    });

    console.log('✨ Seed completed successfully! Database is ready.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

