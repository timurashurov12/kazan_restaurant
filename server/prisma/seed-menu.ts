import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MenuItemData {
  nameRu: string;
  nameEn: string;
  descriptionRu?: string;
  descriptionEn?: string;
  price: number;
  weightOrVolume?: string;
}

interface CategoryData {
  nameRu: string;
  nameEn: string;
  code: string;
  items: MenuItemData[];
}

interface MenuTypeData {
  nameRu: string;
  nameEn: string;
  code: string;
  categories: CategoryData[];
}

const MENU_TYPES: MenuTypeData[] = [
  {
    nameRu: 'Основное меню',
    nameEn: 'Main Menu',
    code: 'main',
    categories: [
      {
        nameRu: 'Холодные закуски',
        nameEn: 'Cold Appetisers',
        code: 'cold-appetisers',
        items: [
          { nameRu: 'Бабагануш', nameEn: 'Babaganoush', descriptionRu: 'Запеченные баклажаны, тахини, лимонный сок, оливковое масло, чеснок', descriptionEn: 'Baked aubergines, tahini, lemon juice, olive oil, garlic', price: 45000 },
          { nameRu: 'Хумус', nameEn: 'Hummus', descriptionRu: 'Горох нут, кунжутная паста, сок лимона, оливковое масло, соль, специи', descriptionEn: 'Chickpeas, sesame paste, lemon juice, olive oil, salt, spices', price: 45000 },
          { nameRu: 'Сырное ассорти', nameEn: 'Cheese platter', descriptionRu: 'Дорблю, маасдам, пармезан, сливочный сыр, орехи, виноград, мёд', descriptionEn: 'Dorblu, Maasdam, Parmesan, cream cheese, nuts, grapes, honey', price: 200000 },
          { nameRu: 'Витело-тонато', nameEn: 'Vitello tonnato', descriptionRu: 'Тонко нарезанная телятина или язык говяжий, соус на основе тунца, майонеза и лимонного сока со специями. Идеально подходит к вину', descriptionEn: 'Thinly sliced veal or beef tongue, tuna-based sauce, mayonnaise and lemon juice with spices. Perfect with wine.', price: 85000 },
          { nameRu: 'Мясная нарезка', nameEn: 'Cold cuts', descriptionRu: 'Казы, копченая думба, язык отварной говяжий, бастурма из конины', descriptionEn: 'Kazy, smoked dumba, boiled beef tongue, horse meat basturma', price: 220000 },
          { nameRu: 'Сузма (чакка)', nameEn: 'Suzma (Chakka yogurt)', descriptionRu: 'Кисломолочный продукт', descriptionEn: 'Sour milk product', price: 25000 },
          { nameRu: 'Паштет куриный с айвой', nameEn: 'Chicken pâté with quince', descriptionRu: 'Печень куриная, масло сливочное, сливки, соль, специи. Подается с вареньем из айвы', descriptionEn: 'Chicken liver, butter, cream, salt, spices. Served with quince jam.', price: 55000 },
          { nameRu: 'Свежие овощи с зеленью', nameEn: 'Fresh vegetables with greens', descriptionRu: 'Помидоры, огурцы, зелень в ассортименте', descriptionEn: 'Tomatoes, cucumbers, assorted greens', price: 90000 },
          { nameRu: 'Соленья', nameEn: 'Pickles', descriptionRu: 'Помидоры, огурцы корнишоны, бейби кукуруза, капуста', descriptionEn: 'Tomatoes, gherkins, baby corn, cabbage', price: 95000 },
          { nameRu: 'Лимон 100 гр', nameEn: 'Lemon 100 g', price: 15000, weightOrVolume: '100 г' },
        ],
      },
      {
        nameRu: 'Горячие закуски',
        nameEn: 'Hot Appetisers',
        code: 'hot-appetisers',
        items: [
          { nameRu: 'Чучвара жареная с зеленью', nameEn: 'Fried chuchvara with herbs', descriptionRu: 'Жареные пельмени, с начинкой из букета зелени, специй. Подается с соусом', descriptionEn: 'Fried dumplings stuffed with a bouquet of herbs and spices. Served with sauce', price: 45000 },
          { nameRu: 'Самса с мясом', nameEn: 'Samsa with meat', descriptionRu: 'Тонкое слоеное тесто, мясо телятины, лук, специи', descriptionEn: 'Thin puff pastry, veal, onions, spices', price: 18000 },
          { nameRu: 'Самса с зеленью', nameEn: 'Samsa with greens', descriptionRu: 'Нежное слоеное тесто с букетом зелени, сливочное масло', descriptionEn: 'Delicate puff pastry with a bouquet of greens, cream butter', price: 16000 },
          { nameRu: 'Самса с тыквой', nameEn: 'Samsa with pumpkin', descriptionRu: 'Тонкое слоеное тесто, тыква с добавлением лука, специи, сливочное масло', descriptionEn: 'Thin puff pastry, pumpkin with added onion, spices, butter', price: 16000 },
          { nameRu: 'Самбуса с мясом', nameEn: 'Sambusa with meat', descriptionRu: 'Тонкое воздушное тесто, рубленое мясо обжаренное в масле. Подается с соусом', descriptionEn: 'Thin, airy dough, minced meat fried in oil. Served with sauce.', price: 55000 },
          { nameRu: 'Самбуса с тыквой', nameEn: 'Sambusa with pumpkin', descriptionRu: 'Тонкое воздушное тесто, тыква, с добавлением лука специи обжареное в масле. Подается с соусом', descriptionEn: 'Thin airy dough, pumpkin, with the addition of onions and spices fried in oil. Served with sauce.', price: 45000 },
        ],
      },
      {
        nameRu: 'Салаты',
        nameEn: 'Salads',
        code: 'salads',
        items: [
          { nameRu: 'Бахор', nameEn: 'Bakhor', descriptionRu: 'Обжаренное мясо телятины, огурцы, помидоры, морковь свежая, лист салата заправка на растительном масле и специях', descriptionEn: 'Fried veal, cucumbers, tomatoes, fresh carrots, lettuce leaves, dressing made with vegetable oil and spices', price: 63000 },
          { nameRu: 'Салат Бухара', nameEn: 'Salad Bukhara', descriptionRu: 'Обжаренные баклажаны в кляре, сладкие помидоры, местный каймак, рукола и соус', descriptionEn: 'Fried aubergines in batter, sweet tomatoes, local kaymak, rocket and sauce', price: 65000 },
          { nameRu: 'Ачик чучук', nameEn: 'Achik Chuchuk', descriptionRu: 'Помидоры сладкие, лук репчатый, красный стручковый перчик, специи, заправка на растительном масле', descriptionEn: 'Sweet tomatoes, onions, red chilli peppers, spices, dressing with vegetable oil', price: 50000 },
          { nameRu: 'Сиявуш', nameEn: 'Siyavush', descriptionRu: 'Нежный салат из обжаренных баклажан, сладких помидор, красного лука, рукколы, листьев салата, лолло россы, сыр панир, горчичная заправка, растительное масло', descriptionEn: 'Delicate salad with roasted aubergines, sweet tomatoes, red onions, rocket, lettuce leaves, lollo rosso, paneer cheese, mustard dressing, vegetable oil', price: 55000 },
          { nameRu: 'Ташкент', nameEn: 'Tashkent', descriptionRu: 'Отварное мясо телятины, редька дайкон, отварное яйцо, лук репчатый, заправлен домашним майонезом, специи', descriptionEn: 'Boiled veal, daikon radish, boiled egg, onion, dressed with homemade mayonnaise, spices', price: 60000 },
          { nameRu: 'Салат "ЙОЗ"', nameEn: 'Salad "Yoz"', descriptionRu: 'Сладкая хурма, апельсин, рукола, местный сыр панир, соус на основе апельсина, оливковое масло', descriptionEn: 'Sweet persimmon, orange, rocket, local paneer cheese, orange-based sauce, olive oil', price: 68000 },
        ],
      },
      {
        nameRu: 'Супы',
        nameEn: 'Soups',
        code: 'soups',
        items: [
          { nameRu: 'Суп по-Эмирски', nameEn: 'Emir-style soup', descriptionRu: 'Насыщенный густой суп из говяжьего бульона. Подается с копченым мясом из говядины и зеленью', descriptionEn: 'A rich, thick soup made from beef broth. Served with smoked beef and herbs.', price: 60000 },
          { nameRu: 'Крем-суп из тыквы с имбирём', nameEn: 'Cream of pumpkin soup with ginger', descriptionRu: 'Крем суп на основе запеченной тыквы и овощного бульона, с добавлением сливок, сливочного масла и имбиря', descriptionEn: 'Cream soup made from baked pumpkin and vegetable stock, with added cream, butter and ginger', price: 46000 },
          { nameRu: 'Крем-суп из чечевицы', nameEn: 'Cream of lentil soup', descriptionRu: 'Крем суп на основе овощного бульона и красной чечевицы с добавлением сливок', descriptionEn: 'Cream soup based on vegetable broth and red lentils with added cream', price: 45000 },
          { nameRu: 'Шурпа из говядины', nameEn: 'Beef shurpa', descriptionRu: 'Насыщенный бульон из говядины с ароматными овощами и добавлением гороха нут', descriptionEn: 'Rich beef broth with aromatic vegetables and the addition of chickpeas', price: 48000 },
          { nameRu: 'Чучвара не классическая', nameEn: 'Chuchvara is not classic', descriptionRu: 'Рубленое мясо говядины завернутое в тонкое тесто ручной лепки с добавлением овощей и густого соуса', descriptionEn: 'Minced beef wrapped in thin handmade dough with the addition of vegetables and thick sauce', price: 50000 },
          { nameRu: 'Лагман', nameEn: 'Lagman', descriptionRu: 'Вытянутая вручную лапша с подливой из баранины и овощей с оригинальной заправкой', descriptionEn: 'Hand-pulled noodles with lamb and vegetable sauce and original dressing', price: 55000 },
          { nameRu: 'Мастава', nameEn: 'Mastava', descriptionRu: 'Классический узбекский суп приготовлен на основе мясо говядины с добавлением томатов, риса и овощей', descriptionEn: 'Classic Uzbek soup made from beef with tomatoes, rice and vegetables', price: 58000 },
        ],
      },
      {
        nameRu: 'Вторые блюда',
        nameEn: 'Main Courses',
        code: 'main-courses',
        items: [
          { nameRu: 'Казан кебаб', nameEn: 'Kazan kebab', descriptionRu: 'Нежное мясо барашка на косточке, приготовленное с картофелем в собственном соку', descriptionEn: 'Tender lamb meat on the bone, cooked with potatoes in its own juice', price: 180000 },
          { nameRu: 'Жиз из говядины', nameEn: 'Beef Jiz', descriptionRu: 'Маринованная мякоть телятины, обжаренная до хрустящей корочки. Подается с картофелем', descriptionEn: 'Marinated veal, fried until crispy. Served with potatoes.', price: 120000 },
          { nameRu: 'Плов "Оши-Софи"', nameEn: 'Plov "Oshi-Sofi"', descriptionRu: 'Этот вид плова приготовлен по старому бухарскому рецепту из мясо телятины, риса и двух видов моркови с добавлением гороха нут и изюма', descriptionEn: 'This type of pilaf is prepared according to an old Bukhara recipe using veal, rice and two types of carrots with the addition of chickpeas and raisins.', price: 85000 },
          { nameRu: 'Плов с айвой', nameEn: 'Pilaf with quince', descriptionRu: 'Вегетарианское блюдо из риса, айвы, моркови с добавлением узбекских специй и хлопкового масла', descriptionEn: 'Vegetarian dish made from rice, quince, carrots with the addition of Uzbek spices and cottonseed oil', price: 85000 },
          { nameRu: 'Конина по-Хански', nameEn: 'Horse meat à la Khan', descriptionRu: 'Томленое в специях мясо Конины. Подается с гарниром пюре из тыквы', descriptionEn: 'Spiced horse meat stew. Served with pumpkin purée.', price: 110000 },
          { nameRu: 'Вагури из баранины 500 гр', nameEn: 'Lamb vaguri 500 gr', descriptionRu: 'Маринованное мясо молодого барашка, обжаренное в кипящем масле. Подается с маринованным луком', descriptionEn: 'Marinated young lamb meat, fried in boiling oil. Served with marinated onions.', price: 230000, weightOrVolume: '500 г' },
          { nameRu: 'Голень ягненка с булгуром', nameEn: 'Lamb shank with bulgur wheat', descriptionRu: 'Томленая в собственном соку и специях нежная голень ягненка. Подается с булгуром', descriptionEn: 'Braised in its own juices and spices, tender lamb shank. Served with bulgur wheat.', price: 135000 },
          { nameRu: 'Томленная утка с яблочным пюре', nameEn: 'Braised duck with apple purée', descriptionRu: 'Обжаренное филе утки. Подается с пюре из яблок', descriptionEn: 'Roasted duck fillet. Served with apple purée.', price: 85000 },
          { nameRu: 'Каурма лагман', nameEn: 'Kaurma lagman', descriptionRu: 'Сытное блюдо из обжаренного мяса с овощами, специями, лапши ручной работы подается с яйцом', descriptionEn: 'A hearty dish of fried meat with vegetables, spices, and handmade noodles served with an egg.', price: 65000 },
          { nameRu: 'Мясоед (ребро говяжье) 100гр', nameEn: 'Meat eater (beef rib) 100 gr', descriptionRu: 'Томленое ребро говядины, приготовленное по особому рецепту. Подается с картофелем', descriptionEn: 'Braised beef ribs, prepared according to a special recipe. Served with potatoes.', price: 45000, weightOrVolume: '100 г' },
          { nameRu: 'Долма', nameEn: 'Dolma', descriptionRu: 'Молодые листья винограда, фаршированные мясом телятины и риса', descriptionEn: 'Young grape leaves, stuffed with veal and rice', price: 65000 },
          { nameRu: 'Долма из грибов', nameEn: 'Mushroom dolma', descriptionRu: 'Молодые листья винограда, фаршированные грибами вешенками. Подаются с соусом. Рекомендуем вегетарианцам', descriptionEn: 'Young grape leaves, stuffed with oyster mushrooms. Served with sauce. Recommended for vegetarians.', price: 60000 },
          { nameRu: 'Судак по-Бухарски', nameEn: 'Pike perch Bukhara style', descriptionRu: 'Обжаренное в панировки филе судака. Подается с томатным соусом из узбекских специй', descriptionEn: 'Fried pike-perch fillet in breadcrumbs. Served with tomato sauce made with Uzbek spices.', price: 95000 },
          { nameRu: 'Еда кочевника', nameEn: "Nomad's food", descriptionRu: 'Блюдо из рубленого мяса конины и баранины, завёрнутое в тонкое тесто ручной лепки, подаётся с особым густым соусом и каймаком', descriptionEn: 'A dish made from minced horse and lamb meat, wrapped in thin handmade dough, served with a special thick sauce and kaymak.', price: 75000 },
          { nameRu: 'Котлета по-Киевски', nameEn: 'Kiev-style cutlet', descriptionRu: 'Нежное филе цыпленка с начинкой из сливочного масла со специями и зеленью обжаренного в панировке. Подается с картофелем пюре и сыром пармизан', descriptionEn: 'Tender chicken fillet stuffed with cream butter with spices and herbs fried in breadcrumbs. Served with mashed potatoes and Parmesan cheese.', price: 67000 },
          { nameRu: 'Куочка Ряба', nameEn: 'The Little Hen', descriptionRu: 'Котлеты из рубленого мяса цыпленка подается с пюре из цветной капусты, соус сливочный', descriptionEn: 'Minced chicken cutlets served with cauliflower purée, cream sauce', price: 65000 },
        ],
      },
      {
        nameRu: 'Лепим сами',
        nameEn: 'We Sculpt Ourselves',
        code: 'we-sculpt',
        items: [
          { nameRu: 'Манты с мясом 3 шт', nameEn: 'Manty with meat 3 pcs', descriptionRu: 'Мешочки из тонкого теста ручной лепки с аппетитной сочной начинкой из говядины лука и специй', descriptionEn: 'Hand-made thin dough pockets with a delicious, juicy filling of beef, onion and spices', price: 50000, weightOrVolume: '3 шт' },
          { nameRu: 'Манты с тыквой 3 шт', nameEn: 'Manty with pumpkin 3 pcs', descriptionRu: 'Мешочки из тонкого теста с начинкой из тыквы, лука и специй', descriptionEn: 'Thin pastry parcels filled with pumpkin, onion and spices', price: 36000, weightOrVolume: '3 шт' },
          { nameRu: 'Манты с зеленью 3 шт', nameEn: 'Manty with greens 3 pcs', descriptionRu: 'Мешочки из тонкого теста с начинкой из букета зелени', descriptionEn: 'Thin pastry parcels filled with a bouquet of herbs', price: 40000, weightOrVolume: '3 шт' },
          { nameRu: 'Манты с семгой 3 шт', nameEn: 'Manty with salmon 3 pcs', descriptionRu: 'Мешочки из тонкого теста с начинкой из семги и сливочного масла, лука и специй', descriptionEn: 'Thin pastry parcels filled with salmon and butter, onion and spices', price: 80000, weightOrVolume: '3 шт' },
          { nameRu: 'Манты с грибами 3 шт', nameEn: 'Manty with mushrooms 3 pcs', descriptionRu: 'Мешочки из тонкого теста с начинкой из грибов', descriptionEn: 'Thin pastry parcels filled with mushrooms', price: 45000, weightOrVolume: '3 шт' },
          { nameRu: 'Манты с уткой 3 шт', nameEn: 'Manty with duck 3 pcs', descriptionRu: 'Мешочки из тонкого теста с начинкой из филе утки, картофеля, лука и специй', descriptionEn: 'Thin pastry parcels filled with duck fillet, potatoes, onions and spices', price: 48000, weightOrVolume: '3 шт' },
        ],
      },
      {
        nameRu: 'Гарниры',
        nameEn: 'Side Dishes',
        code: 'side-dishes',
        items: [
          { nameRu: 'Картофель по-деревенски', nameEn: 'Country-style potatoes', price: 25000 },
          { nameRu: 'Картофель фри', nameEn: 'French fries', price: 25000 },
          { nameRu: 'Картошка с грибами', nameEn: 'Potatoes with mushrooms', price: 30000 },
          { nameRu: 'Овощи жареные', nameEn: 'Fried vegetables', price: 30000 },
          { nameRu: 'Пюре из картофеля', nameEn: 'Mashed potatoes', price: 25000 },
          { nameRu: 'Пюре из цветной капусты', nameEn: 'Cauliflower purée', price: 30000 },
          { nameRu: 'Рис отварной', nameEn: 'Boiled rice', price: 20000 },
          { nameRu: 'Яблочное пюре', nameEn: 'Apple purée', price: 23000 },
          { nameRu: 'Булгур с овощами', nameEn: 'Bulgur with vegetables', price: 25000 },
        ],
      },
      {
        nameRu: 'Соусы',
        nameEn: 'Sauces',
        code: 'sauces',
        items: [
          { nameRu: 'Аджика', nameEn: 'Adjika', price: 10000 },
          { nameRu: 'Барбекю', nameEn: 'Barbecue', price: 10000 },
          { nameRu: 'Горчица', nameEn: 'Mustard', price: 10000 },
          { nameRu: 'Кетчуп', nameEn: 'Ketchup', price: 10000 },
          { nameRu: 'Майонез', nameEn: 'Mayonnaise', price: 10000 },
          { nameRu: 'Сметана', nameEn: 'Sour cream', price: 10000 },
          { nameRu: 'Соус овощной', nameEn: 'Vegetable sauce', price: 10000 },
          { nameRu: 'Тар-тар', nameEn: 'Tartar', price: 10000 },
          { nameRu: 'Эмир', nameEn: 'Emir', price: 10000 },
        ],
      },
      {
        nameRu: 'Десерты',
        nameEn: 'Desserts',
        code: 'desserts',
        items: [
          { nameRu: 'Фруктовое ассорти', nameEn: 'Assorted fruit', price: 120000 },
          { nameRu: 'Крем-брюле', nameEn: 'Crème brûlée', descriptionRu: 'Заварные сливки, карамелизированный сахар, ягоды', descriptionEn: 'Custard cream, caramelised sugar, berries', price: 45000 },
          { nameRu: 'Щербет', nameEn: 'Sherbet', descriptionRu: 'Заварные сливки, орехи, изюм, печенье, шоколад', descriptionEn: 'Custard cream, nuts, raisins, biscuits, chocolate', price: 60000 },
          { nameRu: 'Пахлава', nameEn: 'Pahlava', descriptionRu: 'Пахлава из грецкого ореха, изюма, меда и слоеного теста', descriptionEn: 'Pakhlava made from walnuts, raisins, honey and puff pastry', price: 40000 },
        ],
      },
      {
        nameRu: 'Хлебная корзина',
        nameEn: 'Bread Basket',
        code: 'bread-basket',
        items: [
          { nameRu: 'Лепешка', nameEn: 'Flatbread', price: 8000 },
          { nameRu: 'Хлеб ржаной', nameEn: 'Rye bread', price: 8000 },
        ],
      },
    ],
  },
  {
    nameRu: 'Барное меню',
    nameEn: 'Bar Menu',
    code: 'bar',
    categories: [
      {
        nameRu: 'Вина',
        nameEn: 'Wine',
        code: 'wine',
        items: [
          { nameRu: 'Cabernet Sauvignon (красное сухое)', nameEn: 'Cabernet Sauvignon (red dry)', price: 550000, weightOrVolume: '0.75' },
          { nameRu: 'Rundweiss (белое сухое)', nameEn: 'Rundweiss (white dry)', price: 450000, weightOrVolume: '0.75' },
          { nameRu: 'Bagizagan «Bella Ozkhidea» (красное сухое)', nameEn: 'Bagizagan «Bella Ozkhidea» (red dry)', price: 250000, weightOrVolume: '0.75' },
          { nameRu: 'Bagizagan «Bella Lilia» (белое сухое)', nameEn: 'Bagizagan «Bella Lilia» (white dry)', price: 250000, weightOrVolume: '0.75' },
          { nameRu: 'Bagizagan Select (красное сухое)', nameEn: 'Bagizagan Select (red dry)', price: 300000, weightOrVolume: '0.75' },
          { nameRu: 'Bagizagan Samarkand (красное сухое)', nameEn: 'Bagizagan Samarkand (red dry)', price: 375000, weightOrVolume: '0.75' },
          { nameRu: 'Bagizagan Peri (красное сухое)', nameEn: 'Bagizagan Peri (red dry)', price: 450000, weightOrVolume: '0.75' },
          { nameRu: 'Alazani Valley (белое полусладкое)', nameEn: 'Alazani Valley (white med. sweet)', price: 500000, weightOrVolume: '0.75' },
          { nameRu: 'Mouton Cadet Blanc (белое сухое)', nameEn: 'Mouton Cadet Blanc (white dry)', price: 756000, weightOrVolume: '0.75' },
          { nameRu: 'Mouton Cadet Rouge (красное сухое)', nameEn: 'Mouton Cadet Rouge (red dry)', price: 756000, weightOrVolume: '0.75' },
          { nameRu: 'Piccini Pinot Grigio delle Venezie (белое сухое)', nameEn: 'Piccini Pinot Grigio delle Venezie (white dry)', price: 700000, weightOrVolume: '0.75' },
          { nameRu: 'Pirosmani (красное полу-сухое)', nameEn: 'Pirosmani (red med. dry)', price: 500000, weightOrVolume: '0.75' },
          { nameRu: 'Piccini Prosecco Extra Dry (игристое белое сухое)', nameEn: 'Piccini Prosecco Extra Dry (sparkling white dry)', price: 800000, weightOrVolume: '0.75' },
          { nameRu: 'Khvanchkara (красное полусладкое)', nameEn: 'Khvanchkara (red med. sweet)', price: 1040000, weightOrVolume: '0.75' },
          { nameRu: 'Tsinandali (белое сухое)', nameEn: 'Tsinandali (white dry)', price: 500000, weightOrVolume: '0.75' },
          { nameRu: 'J.P. Chenet Medium Sweet Blanc (белое полусладкое)', nameEn: 'J.P. Chenet Medium Sweet Blanc (white med. sweet)', price: 640000, weightOrVolume: '0.75' },
          { nameRu: 'J.P. Chenet Medium Sweet Rouge (красное полусладкое)', nameEn: 'J.P. Chenet Medium Sweet Rouge (red med. sweet)', price: 640000, weightOrVolume: '0.75' },
          { nameRu: 'Peri Cabernet Sauvignon (красное сухое)', nameEn: 'Peri Cabernet Sauvignon (red dry)', price: 450000, weightOrVolume: '0.75' },
          { nameRu: 'Peri Bagizagan (красное сухое)', nameEn: 'Peri Bagizagan (red dry)', price: 450000, weightOrVolume: '0.75' },
          { nameRu: 'Peri Riesling (белое сухое)', nameEn: 'Peri Riesling (white dry)', price: 450000, weightOrVolume: '0.75' },
          { nameRu: 'Nuara Uzumfermer (красное сухое)', nameEn: 'Nuara Uzumfermer (red dry)', price: 500000, weightOrVolume: '0.75' },
          { nameRu: 'Bagizagan Salute Sparkling Brut', nameEn: 'Bagizagan Salute Sparkling Brut', price: 370000, weightOrVolume: '0.75' },
          { nameRu: 'Bagizagan Salute Sparkling Brut Rosé', nameEn: 'Bagizagan Salute Sparkling Brut Rosé', price: 370000, weightOrVolume: '0.75' },
        ],
      },
      {
        nameRu: 'Виски',
        nameEn: 'Whisky',
        code: 'whisky',
        items: [
          { nameRu: 'Johnnie Walker Black Label', nameEn: 'Johnnie Walker Black Label', price: 1164000, weightOrVolume: '0.7' },
          { nameRu: 'Johnnie Walker Red Label', nameEn: 'Johnnie Walker Red Label', price: 789000, weightOrVolume: '0.7' },
          { nameRu: 'Macallan 12', nameEn: 'Macallan 12', price: 4518000, weightOrVolume: '0.7' },
        ],
      },
      {
        nameRu: 'Коньяки',
        nameEn: 'Cognac',
        code: 'cognac',
        items: [
          { nameRu: 'Tanbour 5', nameEn: 'Tanbour 5', price: 500000, weightOrVolume: '0.5' },
          { nameRu: 'Hennessy', nameEn: 'Hennessy', price: 1425000, weightOrVolume: '0.5' },
        ],
      },
      {
        nameRu: 'Водка',
        nameEn: 'Vodka',
        code: 'vodka',
        items: [
          { nameRu: 'Gold Bukhara', nameEn: 'Gold Bukhara', price: 336000, weightOrVolume: '0.7' },
          { nameRu: 'Beluga noble', nameEn: 'Beluga noble', price: 1437000, weightOrVolume: '0.5' },
          { nameRu: 'Stolichnaya', nameEn: 'Stolichnaya', price: 316000, weightOrVolume: '0.5' },
          { nameRu: 'Stolichnaya Sever', nameEn: 'Stolichnaya Sever', price: 339700, weightOrVolume: '0.5' },
        ],
      },
      {
        nameRu: 'Пиво',
        nameEn: 'Beer',
        code: 'beer',
        items: [
          { nameRu: 'Zatecky Gus (пшеничное)', nameEn: 'Zatecky Gus (wheat)', price: 50000, weightOrVolume: '0.5' },
          { nameRu: 'Sarbast Special (крепкое)', nameEn: 'Sarbast Special (strong)', price: 45000, weightOrVolume: '0.5' },
          { nameRu: 'Sarbast Original (светлое)', nameEn: 'Sarbast Original (lager)', price: 45000, weightOrVolume: '0.5' },
          { nameRu: 'Tuborg (светлое)', nameEn: 'Tuborg (lager)', price: 50000, weightOrVolume: '0.5' },
          { nameRu: 'Hoegaarden (белое)', nameEn: 'Hoegaarden (white)', price: 50000, weightOrVolume: '0.4' },
          { nameRu: 'Hoegaarden Rosé (розовое)', nameEn: 'Hoegaarden Rosé (rosé)', price: 60000, weightOrVolume: '0.25' },
          { nameRu: 'Hoegaarden 0.0% (безалкогольное)', nameEn: 'Hoegaarden 0.0% (non-alcoholic)', price: 50000, weightOrVolume: '0.25' },
          { nameRu: 'Efes (светлое)', nameEn: 'Efes (lager)', price: 50000, weightOrVolume: '0.5' },
          { nameRu: 'Stella Artois (светлое)', nameEn: 'Stella Artois (lager)', price: 50000, weightOrVolume: '0.4' },
          { nameRu: 'Stella Artois Zero 0.0% (безалкогольное)', nameEn: 'Stella Artois Zero 0.0% (non-alcoholic)', price: 50000, weightOrVolume: '0.4' },
          { nameRu: 'Bud (светлое)', nameEn: 'Bud (lager)', price: 50000, weightOrVolume: '0.5' },
          { nameRu: 'Paulaner Münchner Hell (светлое)', nameEn: 'Paulaner Münchner Hell (lager)', price: 60000, weightOrVolume: '0.5' },
          { nameRu: 'Paulaner Weissbier (пшеничное)', nameEn: 'Paulaner Weissbier (wheat)', price: 60000, weightOrVolume: '0.5' },
        ],
      },
      {
        nameRu: 'Закуски к пиву',
        nameEn: 'Snacks to Beer',
        code: 'beer-snacks',
        items: [
          { nameRu: 'Арахис 50 гр', nameEn: 'Peanuts 50 g', price: 5000, weightOrVolume: '50 г' },
          { nameRu: 'Соленые орешки 50 гр', nameEn: 'Salted nuts 50 g', price: 5000, weightOrVolume: '50 г' },
          { nameRu: 'Фисташки 50 гр', nameEn: 'Pistachios 50 g', price: 10000, weightOrVolume: '50 г' },
        ],
      },
      {
        nameRu: 'Кофе',
        nameEn: 'Coffee',
        code: 'coffee',
        items: [
          { nameRu: 'Эспрессо', nameEn: 'Espresso', price: 25000, weightOrVolume: '0.06' },
          { nameRu: 'Американо', nameEn: 'Americano', price: 35000, weightOrVolume: '0.15' },
          { nameRu: 'Капучино', nameEn: 'Cappuccino', price: 45000, weightOrVolume: '0.2' },
          { nameRu: 'Латте', nameEn: 'Latte', price: 45000, weightOrVolume: '0.3' },
          { nameRu: 'Сироп в ассортименте', nameEn: 'Assorted syrups', price: 15000 },
        ],
      },
      {
        nameRu: 'Чай',
        nameEn: 'Tea',
        code: 'tea',
        items: [
          { nameRu: 'Чай в ассортименте', nameEn: 'Tea assortment', price: 35000, weightOrVolume: '0.2' },
          { nameRu: 'Чай с гранатом по-Бухарски', nameEn: 'Bukhara-style herbal tea', price: 40000, weightOrVolume: '0.2' },
          { nameRu: 'Чай с лимоном и мёдом', nameEn: 'Tea with lemon and honey', price: 45000, weightOrVolume: '0.2' },
        ],
      },
      {
        nameRu: 'Прохладные напитки',
        nameEn: 'Cool Drinks',
        code: 'cool-drinks',
        items: [
          { nameRu: 'Соки в ассортименте', nameEn: 'Assorted juices', price: 9000, weightOrVolume: '0.2' },
          { nameRu: 'Вода Б/Газ', nameEn: 'Still water', price: 5000, weightOrVolume: '0.7' },
          { nameRu: 'Coca-Cola, Fanta, Sprite', nameEn: 'Coca-Cola, Fanta, Sprite', price: 16000, weightOrVolume: '0.2' },
          { nameRu: 'Боржоми', nameEn: 'Borjomi', price: 35000, weightOrVolume: '0.5' },
        ],
      },
      {
        nameRu: 'Мороженое',
        nameEn: 'Ice Cream',
        code: 'ice-cream',
        items: [
          { nameRu: 'Шоколадное', nameEn: 'Chocolate', price: 55000, weightOrVolume: '150 г' },
          { nameRu: 'Ванильное', nameEn: 'Vanilla', price: 55000, weightOrVolume: '150 г' },
          { nameRu: 'Брусника', nameEn: 'Lingonberry', price: 55000, weightOrVolume: '150 г' },
          { nameRu: 'Клубничное', nameEn: 'Strawberry', price: 55000, weightOrVolume: '150 г' },
          { nameRu: 'Фисташковое', nameEn: 'Pistachio', price: 55000, weightOrVolume: '150 г' },
          { nameRu: 'Манго', nameEn: 'Mango', price: 55000, weightOrVolume: '150 г' },
        ],
      },
      {
        nameRu: 'Сезонные фрукты',
        nameEn: 'Seasonal Fruits',
        code: 'seasonal-fruits',
        items: [
          { nameRu: 'Вишня', nameEn: 'Cherry', price: 60000, weightOrVolume: '400 г' },
          { nameRu: 'Клубника', nameEn: 'Strawberry', price: 60000, weightOrVolume: '400 г' },
          { nameRu: 'Абрикос', nameEn: 'Apricot', price: 50000, weightOrVolume: '400 г' },
          { nameRu: 'Персик', nameEn: 'Peach', price: 50000, weightOrVolume: '400 г' },
          { nameRu: 'Фруктовое ассорти', nameEn: 'Assorted fruits', price: 130000, weightOrVolume: '1.2 кг' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('Seeding menu with correct structure...');

  const menu = await prisma.menu.upsert({
    where: { id: 'seed_menu_default' },
    create: {
      id: 'seed_menu_default',
      name: 'Kazan',
      sortOrder: 0,
      isActive: true,
    },
    update: { name: 'Kazan' },
  });

  for (let mtIdx = 0; mtIdx < MENU_TYPES.length; mtIdx++) {
    const mtData = MENU_TYPES[mtIdx];

    const menuType = await prisma.menuType.create({
      data: {
        menuId: menu.id,
        code: mtData.code,
        sortOrder: mtIdx,
        isActive: true,
      },
    });

    await prisma.menuTypeTranslation.create({
      data: { menuTypeId: menuType.id, locale: 'ru', name: mtData.nameRu },
    });
    await prisma.menuTypeTranslation.create({
      data: { menuTypeId: menuType.id, locale: 'en', name: mtData.nameEn },
    });

    console.log(`  MenuType: ${mtData.nameRu} (${mtData.categories.length} categories)`);

    for (let cIdx = 0; cIdx < mtData.categories.length; cIdx++) {
      const catData = mtData.categories[cIdx];

      const category = await prisma.category.create({
        data: {
          menuTypeId: menuType.id,
          sortOrder: cIdx,
          isActive: true,
        },
      });

      await prisma.categoryTranslation.create({
        data: { categoryId: category.id, locale: 'ru', name: catData.nameRu },
      });
      await prisma.categoryTranslation.create({
        data: { categoryId: category.id, locale: 'en', name: catData.nameEn },
      });

      for (let iIdx = 0; iIdx < catData.items.length; iIdx++) {
        const item = catData.items[iIdx];

        const menuItem = await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            price: item.price,
            weightOrVolume: item.weightOrVolume || null,
            sortOrder: iIdx,
            isActive: true,
          },
        });

        await prisma.menuItemTranslation.create({
          data: {
            menuItemId: menuItem.id,
            locale: 'ru',
            name: item.nameRu,
            description: item.descriptionRu || null,
          },
        });
        await prisma.menuItemTranslation.create({
          data: {
            menuItemId: menuItem.id,
            locale: 'en',
            name: item.nameEn,
            description: item.descriptionEn || null,
          },
        });
      }

      console.log(`    Category: ${catData.nameRu} (${catData.items.length} items)`);
    }
  }

  console.log('Menu seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
