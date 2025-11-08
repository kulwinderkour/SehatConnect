import React, { useState, memo, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import PharmacyProfileModal from '../components/pharmacy/PharmacyProfileModal';
import NearbyPharmaciesModal from '../components/pharmacy/NearbyPharmaciesModal';
import prescriptionDecoderService from '../services/PrescriptionDecoderService';

const { width } = Dimensions.get('window');

// Profile Icon Component
const ProfileIcon = () => (
  <View style={styles.profileIconContainer}>
    <View style={styles.profileHead} />
    <View style={styles.profileBody} />
  </View>
);

// Cart Icon Component - Shopping Cart
const CartIcon = () => (
  <View style={styles.cartIconContainer}>
    <View style={styles.cartBasket} />
    <View style={styles.cartHandle} />
    <View style={styles.cartWheelLeft} />
    <View style={styles.cartWheelRight} />
  </View>
);

// Search Icon Component
const SearchIcon = () => (
  <View style={styles.searchIconContainer}>
    <View style={styles.searchCircle} />
    <View style={styles.searchHandle} />
  </View>
);

// Modern Camera Icon Component
const CameraIcon = () => (
  <View style={styles.cameraIconContainer}>
    <View style={styles.cameraBody}>
      <View style={styles.cameraLens}>
        <View style={styles.cameraLensInner} />
      </View>
      <View style={styles.cameraFlash} />
    </View>
    <View style={styles.cameraViewfinder} />
  </View>
);

// Modern Back Arrow Icon Component
const BackArrowIcon = () => (
  <View style={styles.backArrowIconContainer}>
    <View style={styles.arrowLine} />
    <View style={styles.arrowHeadTop} />
    <View style={styles.arrowHeadBottom} />
  </View>
);

// Location Pin Icon Component
const LocationPinIcon = () => (
  <View style={styles.locationPinContainer}>
    <View style={styles.locationPinOuter}>
      <View style={styles.locationPinInner} />
    </View>
    <View style={styles.locationPinPoint} />
  </View>
);

type Category = {
  id: string;
  name: string;
  badge?: string;
  imageUrl: string;
  bgColor: string;
};

type Medicine = {
  id: string;
  name: string;
  price: number;
  pharmacy: string;
  stock: 'inStock' | 'lowStock' | 'outStock';
  category?: string;
  imageUrl?: string;
};

type CartItem = {
  medicine: Medicine;
  quantity: number;
};

// Modern Icon Component
const CategoryIcon = ({ name }: { name: string }) => {
  const getIconStyles = () => {
    switch (name) {
      case 'Glucometers':
        return { container: '#E3F2FD', primary: '#2196F3', secondary: '#1976D2' };
      case 'Vitamins A-Z':
        return { container: '#FFF3E0', primary: '#FF9800', secondary: '#F57C00' };
      case 'Sports Nutrition':
        return { container: '#FFF9C4', primary: '#FFC107', secondary: '#FFA000' };
      case 'Skin Care':
        return { container: '#E8F5E9', primary: '#4CAF50', secondary: '#388E3C' };
      case 'Hair Care':
        return { container: '#FCE4EC', primary: '#E91E63', secondary: '#C2185B' };
      case 'Women Care':
        return { container: '#F3E5F5', primary: '#9C27B0', secondary: '#7B1FA2' };
      default:
        return { container: '#F5F5F5', primary: '#9E9E9E', secondary: '#757575' };
    }
  };

  const colors = getIconStyles();

  const renderIcon = () => {
    switch (name) {
      case 'Glucometers':
        return (
          <View style={styles.iconWrapper}>
            <View style={[styles.deviceBody, { backgroundColor: colors.primary }]}>
              <View style={styles.deviceScreen} />
              <View style={styles.deviceButton} />
            </View>
          </View>
        );
      case 'Vitamins A-Z':
        return (
          <View style={styles.iconWrapper}>
            <View style={[styles.pillContainer]}>
              <View style={[styles.pill, { backgroundColor: colors.primary }]} />
              <View style={[styles.pillHalf, { backgroundColor: colors.secondary }]} />
            </View>
          </View>
        );
      case 'Sports Nutrition':
        return (
          <View style={styles.iconWrapper}>
            <View style={[styles.dumbbellBar, { backgroundColor: colors.primary }]} />
            <View style={[styles.dumbbellWeight, { backgroundColor: colors.secondary, left: -5 }]} />
            <View style={[styles.dumbbellWeight, { backgroundColor: colors.secondary, right: -5 }]} />
          </View>
        );
      case 'Skin Care':
        return (
          <View style={styles.iconWrapper}>
            <View style={[styles.bottleBody, { backgroundColor: colors.primary }]}>
              <View style={[styles.bottlePump, { backgroundColor: colors.secondary }]} />
            </View>
          </View>
        );
      case 'Hair Care':
        return (
          <View style={styles.iconWrapper}>
            <View style={[styles.scissorsTop, { backgroundColor: colors.primary }]} />
            <View style={[styles.scissorsBottom, { backgroundColor: colors.secondary }]} />
          </View>
        );
      case 'Women Care':
        return (
          <View style={styles.iconWrapper}>
            <View style={[styles.heartShape, { backgroundColor: colors.primary }]} />
          </View>
        );
      default:
        return (
          <View style={styles.iconWrapper}>
            <View style={[styles.defaultIcon, { backgroundColor: colors.primary }]} />
          </View>
        );
    }
  };

  return <View style={[styles.categoryIconContainer, { backgroundColor: colors.container }]}>{renderIcon()}</View>;
};

const CategoryCard = memo(({ category, onPress }: { category: Category; onPress: () => void }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.categoryImageContainer, { backgroundColor: category.bgColor }]}>
      <Image 
        source={{ uri: category.imageUrl }} 
        style={styles.categoryProductImage}
        resizeMode="contain"
      />
      {category.badge && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{category.badge}</Text>
        </View>
      )}
    </View>
    <Text style={styles.categoryName}>{category.name}</Text>
  </TouchableOpacity>
));

const PharmacyScreen = memo(() => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNearbyPharmaciesModal, setShowNearbyPharmaciesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('144006 Jalandhar');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pinCode, setPinCode] = useState('144006');
  const [cityName, setCityName] = useState('Jalandhar');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Top searches data
  const topSearches = useMemo(() => [
    { id: '1', name: 'Dolo 650', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop' },
    { id: '2', name: 'Pan D', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop' },
    { id: '3', name: 'Condom', image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=100&h=100&fit=crop' },
    { id: '4', name: 'Lactacyd', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop' },
    { id: '5', name: 'Cetaphil', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop' },
    { id: '6', name: 'Mounjaro', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop' },
    { id: '7', name: 'Ecosprin 75', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop' },
  ], []);

  // Sample categories
  const categories: Category[] = useMemo(() => [
    { 
      id: '2', 
      name: 'Vitamins A-Z',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      bgColor: '#FFF3E0'
    },
    { 
      id: '3', 
      name: 'Sports Nutrition', 
      badge: 'NEW',
      imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop',
      bgColor: '#FFF9C4'
    },
    { 
      id: '4', 
      name: 'Skin Care',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      bgColor: '#E8F5E9'
    },
    { 
      id: '5', 
      name: 'Hair Care',
      imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
      bgColor: '#FCE4EC'
    },
    { 
      id: '6', 
      name: 'Women Care',
      imageUrl: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&h=400&fit=crop',
      bgColor: '#F3E5F5'
    },
    { 
      id: '7', 
      name: 'Sexual Wellness',
      imageUrl: 'https://www.durexindia.com/cdn/shop/files/DurexCloserThanEver.webp?v=1712563019',
      bgColor: '#FFE8F0'
    },
  ], []);

  // Sample medicine data with categories
  const medicines: Medicine[] = useMemo(() => [
    // Mixed/Random order - not grouped by category
    { id: '18', name: 'Durex Extra Time Condoms 3', price: 99, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'Sexual Wellness', imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/I40168/durex-extra-time-packet-of-10-condoms-6.01-1743505618.jpg' },
    { id: '1', name: 'Paracetamol 500mg Strip of 15', price: 25, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'General', imageUrl: 'https://www.biofieldpharma.com/wp-content/uploads/2023/06/BIOFIELD-PYREGEM-TAB-1-scaled.jpg' },
    { id: '9', name: 'Cetaphil Gentle Cleanser', price: 599, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'Skin Care', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200' },
    { id: '19', name: 'Durex Extra Time Condoms 10', price: 246, pharmacy: 'MedPlus', stock: 'inStock', category: 'Sexual Wellness', imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/I40168/durex-extra-time-packet-of-10-condoms-6.01-1743505618.jpg' },
    { id: '3', name: 'Vitamin D3 1000 IU', price: 99, pharmacy: 'City Medical', stock: 'lowStock', category: 'Vitamins A-Z', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
    { id: '15', name: 'Folic Acid 5mg Tablets 100s', price: 45, pharmacy: 'City Medical', stock: 'inStock', category: 'Women Care', imageUrl: 'https://globelapharma.com/wp-content/uploads/2023/01/FOLIC-ACID-1.png' },
    { id: '20', name: 'Himalaya Confido Tablet 60', price: 185, pharmacy: 'Guardian Pharmacy', stock: 'inStock', category: 'Sexual Wellness', imageUrl: 'https://himalayawellness.in/cdn/shop/products/confido-tab.jpg' },
    { id: '6', name: 'Whey Protein 1kg', price: 2499, pharmacy: 'HealthKart', stock: 'inStock', category: 'Sports Nutrition', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200' },
    { id: '12', name: 'Minoxidil 5% Solution', price: 549, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'Hair Care', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200' },
    { id: '21', name: 'Paracip 500mg Strip of 10', price: 18, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'General', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
    { id: '24', name: 'Dabur Shilajit Capsule 100', price: 435, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'Sexual Wellness', imageUrl: 'https://www.daburshop.com/cdn/shop/files/1_42d9e29a-69c7-4b03-bd34-4ad54a62bbc3.png' },
    { id: '2', name: 'OneTouch Select Glucometer', price: 799, pharmacy: 'MedPlus', stock: 'inStock', category: 'Glucometers', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=200' },
    { id: '10', name: 'Neutrogena Hydro Boost', price: 449, pharmacy: 'MedPlus', stock: 'inStock', category: 'Skin Care', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200' },
    { id: '4', name: 'Multivitamin Tablets', price: 249, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'Vitamins A-Z', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
    { id: '25', name: 'Durex Invisible Super Thin 10', price: 299, pharmacy: 'MedPlus', stock: 'inStock', category: 'Sexual Wellness', imageUrl: 'https://www.durexindia.com/cdn/shop/files/1_31.webp' },
    { id: '7', name: 'Creatine Monohydrate', price: 899, pharmacy: 'Nutrabay', stock: 'inStock', category: 'Sports Nutrition', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200' },
    { id: '22', name: 'Dolo 650 Strip of 15 Tablets', price: 32, pharmacy: 'MedPlus', stock: 'inStock', category: 'General', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
    { id: '13', name: 'Biotin Hair Tablets', price: 399, pharmacy: 'HealthVit', stock: 'inStock', category: 'Hair Care', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200' },
    { id: '26', name: 'Manforce Cocktail Condoms 10s', price: 125, pharmacy: 'Guardian Pharmacy', stock: 'inStock', category: 'Sexual Wellness', imageUrl: 'https://cdn01.pharmeasy.in/dam/products_otc/I43880/manforce-cocktail-strawberry-vanilla-flav-condom-10s-1-1669711054.jpg' },
    { id: '5', name: 'Vitamin B Complex', price: 159, pharmacy: 'Sharma Medical', stock: 'inStock', category: 'Vitamins A-Z', imageUrl: 'https://m.media-amazon.com/images/I/51tq19WqmFL._AC_UF1000,1000_QL80_.jpg' },
    { id: '11', name: 'La Roche-Posay Sunscreen', price: 1299, pharmacy: 'Guardian Pharmacy', stock: 'inStock', category: 'Skin Care', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200' },
    { id: '17', name: 'Lactacyd Milky Soft Intimate Wash 150ml', price: 299, pharmacy: 'Guardian Pharmacy', stock: 'inStock', category: 'Women Care', imageUrl: 'https://images.apollo247.in/pub/media/catalog/product/l/a/lac0068-11.jpg' },
    { id: '8', name: 'BCAA Powder', price: 1299, pharmacy: 'MuscleBlaze', stock: 'lowStock', category: 'Sports Nutrition', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200' },
    { id: '14', name: 'Anti-Dandruff Shampoo', price: 299, pharmacy: 'MedPlus', stock: 'lowStock', category: 'Hair Care', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200' },
    { id: '23', name: 'Crocin Advance 650 Strip of 15', price: 35, pharmacy: 'City Medical', stock: 'inStock', category: 'General', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
    { id: '27', name: 'VWash Plus Expert Intimate Hygiene Wash 100ml', price: 149, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'Women Care', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7iAk2pr-yXsimefD3nwhKzKfo8D06Fx5EWA&s' },
    { id: '28', name: 'Calpol 650mg Strip of 15 Tablets', price: 30, pharmacy: 'Guardian Pharmacy', stock: 'inStock', category: 'General', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
    { id: '29', name: 'Combiflam Strip of 20 Tablets', price: 45, pharmacy: 'Apollo Pharmacy', stock: 'inStock', category: 'General', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
  ], []);

  const filteredMedicines = useMemo(() => {
    let filtered = medicines;
    
    // Filter by search query - search in both name and category
    if (searchQuery) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (medicine.category && medicine.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(medicine => medicine.category === selectedCategory);
    }
    
    return filtered;
  }, [medicines, searchQuery, selectedCategory]);

  // Get medicines to display on main screen (show all or category filtered)
  const displayMedicines = useMemo(() => {
    if (searchQuery) {
      return []; // Don't show on main screen when searching
    }
    if (selectedCategory) {
      return medicines.filter(medicine => medicine.category === selectedCategory);
    }
    // Show all medicines when scrolling
    return medicines;
  }, [medicines, searchQuery, selectedCategory]);

  const addToCart = useCallback((medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
    Alert.alert('Added to Cart', `${medicine.name} added to cart`);
  }, [cart]);

  const removeFromCart = useCallback((medicineId: string) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  }, [cart]);

  const updateQuantity = useCallback((medicineId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(medicineId);
    } else {
      setCart(cart.map(item =>
        item.medicine.id === medicineId
          ? { ...item, quantity }
          : item
      ));
    }
  }, [cart, removeFromCart]);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
  }, [cart]);

  const handleCategoryPress = useCallback((category: Category) => {
    setSelectedCategory(category.name);
    // Scroll to medicines section
    scrollViewRef.current?.scrollTo({ y: 600, animated: true });
  }, []);

  // Fetch location details from PIN code
  const fetchLocationFromPinCode = useCallback(async (pin: string) => {
    // Only fetch if PIN is 6 digits
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return;
    }

    setIsFetchingLocation(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const city = postOffice.District || postOffice.Region || postOffice.Name;
        setCityName(city);
        setLocation(`${pin} ${city}`);
      } else {
        // If API fails, just use the PIN code
        setCityName('');
        setLocation(pin);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      // Don't show alert, just use the PIN code
      setCityName('');
      setLocation(pin);
    } finally {
      setIsFetchingLocation(false);
    }
  }, []);

  const handlePinCodeChange = useCallback((text: string) => {
    // Only allow digits
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length <= 6) {
      setPinCode(cleanedText);
      
      // Auto-fetch when 6 digits are entered
      if (cleanedText.length === 6) {
        fetchLocationFromPinCode(cleanedText);
      }
    }
  }, [fetchLocationFromPinCode]);

  const handleLocationSave = useCallback(() => {
    if (pinCode.length === 6) {
      if (cityName) {
        setLocation(`${pinCode} ${cityName}`);
      } else {
        setLocation(pinCode);
      }
      setShowLocationModal(false);
    } else {
      Alert.alert('Invalid PIN', 'Please enter a valid 6-digit PIN code');
    }
  }, [pinCode, cityName]);

  // Handle prescription upload
  const handlePrescriptionUpload = useCallback(async () => {
    try {
      Alert.alert(
        'Upload Prescription',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: async () => {
              try {
                setIsDecoding(true);
                const image = await ImageCropPicker.openCamera({
                  width: 1200,
                  height: 1600,
                  cropping: true,
                  compressImageQuality: 0.8,
                  includeBase64: false,
                  mediaType: 'photo',
                });
                await processPrescriptionImage(image.path);
              } catch (error: any) {
                if (error.code !== 'E_PICKER_CANCELLED') {
                  console.error('Camera error:', error);
                  Alert.alert('Error', 'Failed to take photo. Please try again.');
                }
                setIsDecoding(false);
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                setIsDecoding(true);
                const image = await ImageCropPicker.openPicker({
                  width: 1200,
                  height: 1600,
                  cropping: true,
                  compressImageQuality: 0.8,
                  includeBase64: false,
                  mediaType: 'photo',
                });
                await processPrescriptionImage(image.path);
              } catch (error: any) {
                if (error.code !== 'E_PICKER_CANCELLED') {
                  console.error('Gallery error:', error);
                  Alert.alert('Error', 'Failed to select photo. Please try again.');
                }
                setIsDecoding(false);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error opening image picker:', error);
      setIsDecoding(false);
    }
  }, []);

  // Process prescription image
  const processPrescriptionImage = useCallback(async (imageUri: string) => {
    try {
      // Show loading animation
      const decodedPrescription = await prescriptionDecoderService.decodePrescription(
        imageUri,
        userProfile?.patientInfo
      );

      // Navigate to decoder screen with decoded data
      navigation.navigate('PrescriptionDecoder' as any, {
        prescription: decodedPrescription,
        imageUri,
      });
    } catch (error: any) {
      console.error('Error decoding prescription:', error);
      Alert.alert(
        'Decoding Failed',
        error.message || 'Failed to decode prescription. Please ensure the image is clear and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDecoding(false);
    }
  }, [navigation, userProfile]);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroContainer}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.heroTitle}>Medical Store</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => {
                  setPinCode(pinCode);
                  setCityName(cityName);
                  setShowLocationModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.locationText}>{location}</Text>
                <Text style={styles.dropdownIcon}> ▼</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity 
                style={[styles.actionCircle, styles.firstActionCircle]}
                onPress={() => setShowNearbyPharmaciesModal(true)}
              >
                <LocationPinIcon />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionCircle}
                onPress={() => setShowProfileModal(true)}
              >
                <ProfileIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCircle} onPress={() => setShowCart(true)}>
                <CartIcon />
                {cart.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cart.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => setShowSearchModal(true)}
            activeOpacity={0.9}
          >
            <SearchIcon />
            <Text style={styles.searchPlaceholder}>Search for medicines</Text>
            <TouchableOpacity 
              style={styles.searchBarCameraButton}
              onPress={handlePrescriptionUpload}
              activeOpacity={0.7}
              disabled={isDecoding}
            >
              {isDecoding ? (
                <ActivityIndicator size="small" color="#1E88E5" />
              ) : (
                <CameraIcon />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Nearby Pharmacy Banner */}
        <TouchableOpacity 
          style={styles.nearbyBanner}
          onPress={() => setShowNearbyPharmaciesModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.nearbyBannerContent}>
            <View style={styles.nearbyBannerIcon}>
              <LocationPinIcon />
            </View>
            <View style={styles.nearbyBannerText}>
              <Text style={styles.nearbyBannerTitle}>Find Nearby Pharmacies</Text>
              <Text style={styles.nearbyBannerSubtitle}>
                Locate generic & private medical stores near you
              </Text>
            </View>
            <Text style={styles.nearbyBannerArrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Search Results */}
        {searchQuery.length > 0 ? (
          <View style={styles.searchResults}>
            <View style={styles.searchResultsHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchText}>✕ Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.medicinesGrid}>
              {filteredMedicines.map(medicine => (
                <View key={medicine.id} style={styles.medicineProductCard}>
                  {medicine.imageUrl && (
                    <Image 
                      source={{ uri: medicine.imageUrl }} 
                      style={styles.medicineProductImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.medicineProductInfo}>
                    <Text style={styles.medicineProductName} numberOfLines={2}>{medicine.name}</Text>
                    <Text style={styles.medicineProductPharmacy} numberOfLines={1}>{medicine.pharmacy}</Text>
                    <View style={styles.medicineProductFooter}>
                      <Text style={styles.medicineProductPrice}>₹{medicine.price}</Text>
                      <TouchableOpacity 
                        style={[styles.addToCartSmallBtn, medicine.stock === 'outStock' && styles.disabledBtn]}
                        onPress={() => medicine.stock !== 'outStock' && addToCart(medicine)}
                        disabled={medicine.stock === 'outStock'}
                      >
                        <Text style={styles.addToCartSmallText}>
                          {medicine.stock === 'outStock' ? 'Out' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.smallStockBadge, styles[medicine.stock]]}>
                      <Text style={styles.smallStockText}>
                        {medicine.stock === 'inStock' ? '✓' : medicine.stock === 'lowStock' ? '!' : '✕'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            {filteredMedicines.length === 0 && (
              <Text style={styles.noResults}>No medicines found for "{searchQuery}"</Text>
            )}
          </View>
        ) : (
          <>
            {/* Top Selling Categories */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Selling Categories</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.categoriesGrid}>
                {categories.map(category => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    onPress={() => handleCategoryPress(category)}
                  />
                ))}
              </View>
            </View>

            {/* Medicines Section */}
            {displayMedicines.length > 0 && (
              <View style={styles.medicinesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {selectedCategory ? selectedCategory : 'All Medicines'}
                  </Text>
                  {selectedCategory && (
                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                      <Text style={styles.clearFilterText}>Clear Filter</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.medicinesGrid}>
                  {displayMedicines.map(medicine => (
                    <View key={medicine.id} style={styles.medicineProductCard}>
                      {medicine.imageUrl && (
                        <Image 
                          source={{ uri: medicine.imageUrl }} 
                          style={styles.medicineProductImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.medicineProductInfo}>
                        <Text style={styles.medicineProductName} numberOfLines={2}>{medicine.name}</Text>
                        <Text style={styles.medicineProductPharmacy} numberOfLines={1}>{medicine.pharmacy}</Text>
                        <View style={styles.medicineProductFooter}>
                          <Text style={styles.medicineProductPrice}>₹{medicine.price}</Text>
                          <TouchableOpacity 
                            style={[styles.addToCartSmallBtn, medicine.stock === 'outStock' && styles.disabledBtn]}
                            onPress={() => medicine.stock !== 'outStock' && addToCart(medicine)}
                            disabled={medicine.stock === 'outStock'}
                          >
                            <Text style={styles.addToCartSmallText}>
                              {medicine.stock === 'outStock' ? 'Out' : 'Add'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={[styles.smallStockBadge, styles[medicine.stock]]}>
                          <Text style={styles.smallStockText}>
                            {medicine.stock === 'inStock' ? '✓' : medicine.stock === 'lowStock' ? '!' : '✕'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Additional sections can go here */}
            <View style={styles.spacer} />
          </>
        )}
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="fade" transparent>
        <View style={styles.centeredOverlay}>
          <View style={styles.locationModal}>
            <Text style={styles.locationModalTitle}>Change delivery location</Text>
            <TextInput
              value={pinCode}
              onChangeText={handlePinCodeChange}
              placeholder="Enter PIN code"
              placeholderTextColor="#9BA9C5"
              style={styles.locationInput}
              autoFocus
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleLocationSave}
            />
            {isFetchingLocation && (
              <Text style={styles.fetchingText}>Fetching location...</Text>
            )}
            {cityName && pinCode.length === 6 && !isFetchingLocation && (
              <Text style={styles.cityNameText}>{cityName}</Text>
            )}
            <View style={styles.locationModalActions}>
              <TouchableOpacity style={styles.locationModalButton} onPress={() => setShowLocationModal(false)}>
                <Text style={styles.locationModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.locationModalButton, 
                  styles.locationModalButtonPrimary,
                  (isFetchingLocation || pinCode.length !== 6) && styles.locationModalButtonDisabled
                ]} 
                onPress={handleLocationSave}
                disabled={isFetchingLocation || pinCode.length !== 6}
              >
                <Text style={[styles.locationModalButtonText, styles.locationModalButtonPrimaryText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal 
        visible={showSearchModal} 
        animationType="slide" 
        transparent={false}
        statusBarTranslucent={false}
      >
        <SafeAreaView style={styles.searchModalContainer} edges={['top', 'bottom']}>
          <View style={styles.searchModalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)} style={styles.backButton}>
              <BackArrowIcon />
            </TouchableOpacity>
            <View style={styles.searchModalInputContainer}>
              <SearchIcon />
              <TextInput
                placeholder="Search for Medicines/Lab Tests/..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchModalInput}
                placeholderTextColor="#A0A0A0"
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <CameraIcon />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.searchModalContent}>
            {/* Top Categories */}
            <View style={styles.searchSection}>
              <Text style={styles.searchSectionTitle}>Top categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topCategoriesScroll}>
                {categories.slice(0, 4).map(category => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={styles.topCategoryItem}
                    onPress={() => {
                      setSearchQuery(category.name);
                      setShowSearchModal(false);
                    }}
                  >
                    <View style={[styles.topCategoryImage, { backgroundColor: category.bgColor }]}>
                      <Image 
                        source={{ uri: category.imageUrl }} 
                        style={styles.topCategoryProductImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.topCategoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Top Searches */}
            <View style={styles.searchSection}>
              <Text style={styles.searchSectionTitle}>Top Searches</Text>
              {topSearches.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.topSearchItem}
                  onPress={() => {
                    setSearchQuery(item.name);
                    setShowSearchModal(false);
                  }}
                >
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.topSearchImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.topSearchName}>{item.name}</Text>
                  <Text style={styles.topSearchArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Profile Modal */}
      <PharmacyProfileModal 
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Nearby Pharmacies Modal */}
      <NearbyPharmaciesModal
        visible={showNearbyPharmaciesModal}
        onClose={() => setShowNearbyPharmaciesModal(false)}
      />

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.cartModal}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Shopping Cart ({cart.length})</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.cartItems}>
              {cart.length === 0 ? (
                <View style={styles.emptyCart}>
                  <Text style={styles.emptyCartText}>Your cart is empty</Text>
                </View>
              ) : (
                cart.map(item => (
                  <View key={item.medicine.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.medicine.name}</Text>
                      <Text style={styles.cartItemPrice}>₹{item.medicine.price}</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                        style={styles.quantityBtn}
                      >
                        <Text style={styles.quantityBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                        style={styles.quantityBtn}
                      >
                        <Text style={styles.quantityBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            {cart.length > 0 && (
              <View style={styles.cartFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>₹{getTotalPrice()}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutBtn} onPress={() => Alert.alert('Checkout', 'Proceeding to checkout...')}>
                  <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Profile Icon Styles
  profileIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E2A4A',
    marginBottom: 2,
  },
  profileBody: {
    width: 16,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#1E2A4A',
  },
  // Cart Icon Styles - Shopping Cart
  cartIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBasket: {
    width: 16,
    height: 11,
    borderWidth: 2,
    borderColor: '#1E2A4A',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
    marginTop: 3,
  },
  cartHandle: {
    position: 'absolute',
    top: 2,
    left: 1,
    width: 8,
    height: 6,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: '#1E2A4A',
    borderTopLeftRadius: 3,
    transform: [{ rotate: '-10deg' }],
  },
  cartWheelLeft: {
    position: 'absolute',
    bottom: 1,
    left: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E2A4A',
  },
  cartWheelRight: {
    position: 'absolute',
    bottom: 1,
    right: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E2A4A',
  },
  // Search Icon Styles
  searchIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 12,
  },
  searchCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  searchHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 6,
    height: 2,
    backgroundColor: '#1E88E5',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  // Camera Icon Styles
  cameraIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraBody: {
    width: 20,
    height: 16,
    backgroundColor: '#1E88E5',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLensInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E88E5',
  },
  cameraFlash: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
  cameraViewfinder: {
    position: 'absolute',
    top: -2,
    left: 2,
    width: 6,
    height: 4,
    backgroundColor: '#1E88E5',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // Back Arrow Icon Styles
  backArrowIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  arrowLine: {
    width: 16,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
    position: 'absolute',
  },
  arrowHeadTop: {
    width: 8,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
    position: 'absolute',
    left: 0,
    top: 8,
    transform: [{ rotate: '-45deg' }],
  },
  arrowHeadBottom: {
    width: 8,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
    position: 'absolute',
    left: 0,
    bottom: 8,
    transform: [{ rotate: '45deg' }],
  },
  // Location Pin Icon Styles
  locationPinContainer: {
    width: 24,
    height: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  locationPinOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  locationPinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF5252',
    marginTop: -3,
  },
  heroContainer: {
    backgroundColor: '#E9F4FF',
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitleGroup: {
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F7FF',
    borderWidth: 1,
    borderColor: '#C8DAF5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginLeft: 12,
  },
  firstActionCircle: {
    marginLeft: 0,
  },
  actionIcon: {
    fontSize: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E2A4A',
    marginBottom: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    color: '#1E2A4A',
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#4E6FAE',
    marginLeft: 4,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#C8DAF5',
  },
  searchBarCameraButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: '#1E88E5',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  centeredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  locationModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2A4A',
    marginBottom: 18,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#C8DAF5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E2A4A',
    marginBottom: 22,
    backgroundColor: '#F8FBFF',
  },
  fetchingText: {
    fontSize: 13,
    color: '#1E88E5',
    marginTop: -12,
    marginBottom: 18,
    fontStyle: 'italic',
  },
  cityNameText: {
    fontSize: 15,
    color: '#4CAF50',
    marginTop: -12,
    marginBottom: 18,
    fontWeight: '600',
  },
  locationModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  locationModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginLeft: 12,
  },
  locationModalButtonText: {
    fontSize: 14,
    color: '#60739B',
    fontWeight: '500',
  },
  locationModalButtonPrimary: {
    backgroundColor: '#1E88E5',
  },
  locationModalButtonDisabled: {
    backgroundColor: '#B0BEC5',
    opacity: 0.6,
  },
  locationModalButtonPrimaryText: {
    color: '#fff',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 60) / 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryImageContainer: {
    position: 'relative',
    marginBottom: 8,
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryProductImage: {
    width: '70%',
    height: '70%',
  },
  categoryIconContainer: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconWrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Glucometer icon
  deviceBody: {
    width: 35,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceScreen: {
    width: 25,
    height: 15,
    backgroundColor: '#fff',
    borderRadius: 3,
    marginBottom: 5,
  },
  deviceButton: {
    width: 15,
    height: 15,
    backgroundColor: '#fff',
    borderRadius: 7.5,
  },
  // Pill icon
  pillContainer: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  pill: {
    width: 40,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  pillHalf: {
    width: 20,
    height: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    position: 'absolute',
    right: 0,
  },
  // Dumbbell icon
  dumbbellBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  dumbbellWeight: {
    width: 12,
    height: 20,
    borderRadius: 4,
    position: 'absolute',
    top: -7,
  },
  // Bottle icon
  bottleBody: {
    width: 25,
    height: 40,
    borderRadius: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bottlePump: {
    width: 15,
    height: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginTop: -6,
  },
  // Scissors icon
  scissorsTop: {
    width: 30,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 15,
    transform: [{ rotate: '-15deg' }],
  },
  scissorsBottom: {
    width: 30,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 27,
    transform: [{ rotate: '15deg' }],
  },
  // Heart icon
  heartShape: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    transform: [{ rotate: '-45deg' }],
  },
  // Default icon
  defaultIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
  },
  categoryBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  searchResults: {
    padding: 20,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  clearSearchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  medicinePharmacy: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  medicinePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  inStock: {
    backgroundColor: '#E8F5E9',
  },
  lowStock: {
    backgroundColor: '#FFF3E0',
  },
  outStock: {
    backgroundColor: '#FFEBEE',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  addToCartBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  disabledBtn: {
    backgroundColor: '#CCC',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  spacer: {
    height: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cartModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#666',
  },
  cartItems: {
    maxHeight: 300,
  },
  emptyCart: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    backgroundColor: '#F0F0F0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#333',
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  checkoutBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Search Modal Styles
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9BA9C5',
  },
  // Nearby Pharmacy Banner Styles
  nearbyBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FF5252',
  },
  nearbyBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  nearbyBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nearbyBannerText: {
    flex: 1,
  },
  nearbyBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2A4A',
    marginBottom: 4,
  },
  nearbyBannerSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  nearbyBannerArrow: {
    fontSize: 28,
    color: '#FF5252',
    fontWeight: '300',
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
    marginRight: 12,
  },
  searchModalInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchModalInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    padding: 0,
  },
  cameraButton: {
    padding: 6,
    marginLeft: 12,
  },
  searchModalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 12,
  },
  searchSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  topCategoriesScroll: {
    paddingHorizontal: 16,
  },
  topCategoryItem: {
    marginRight: 12,
    alignItems: 'center',
    width: 110,
  },
  topCategoryImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  topCategoryProductImage: {
    width: '65%',
    height: '65%',
  },
  topCategoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  topSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  topSearchImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  topSearchName: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  topSearchArrow: {
    fontSize: 20,
    color: '#D0D0D0',
  },
  // Medicines Section Styles
  medicinesSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
  },
  medicinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  medicineProductCard: {
    width: (width - 50) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  medicineProductImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#FAFAFA',
  },
  medicineProductInfo: {
    padding: 8,
  },
  medicineProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
    height: 32,
    lineHeight: 16,
  },
  medicineProductPharmacy: {
    fontSize: 10,
    color: '#757575',
    marginBottom: 6,
  },
  medicineProductFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  medicineProductPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  addToCartSmallBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addToCartSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  smallStockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  smallStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PharmacyScreen;
