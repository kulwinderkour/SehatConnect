import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, ExternalLink, Heart, Shield, Baby, Users } from 'lucide-react-native';

// Government health scheme data structure
interface HealthScheme {
  id: string;
  name: string;
  description: string;
  keyBenefits: string;
  category: 'insurance' | 'maternal' | 'child' | 'immunization' | 'general';
  icon: React.ReactNode;
  color: string;
  agency?: string;
  website?: string;
}

// Government health schemes data
const governmentSchemes: HealthScheme[] = [
  {
    id: '1',
    name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    description: 'A health assurance scheme for poor and vulnerable families.',
    keyBenefits: '₹5 lakh per family per year for secondary & tertiary care hospitalizations; includes pre- and post-hospitalization, medicines, diagnostics.',
    category: 'insurance',
    icon: <Shield size={24} color="#10b981" />,
    color: '#10b981',
    agency: 'National Health Authority',
  },
  {
    id: '2',
    name: 'Central Government Health Scheme (CGHS)',
    description: 'For central government employees, pensioners and their dependents.',
    keyBenefits: 'OPD, hospitalization, diagnostic services, wellness centres, dispensaries, etc.',
    category: 'insurance',
    icon: <Shield size={24} color="#3b82f6" />,
    color: '#3b82f6',
    agency: 'Government of India',
  },
  {
    id: '3',
    name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
    description: 'Insurance for below poverty line families / informal sector workers.',
    keyBenefits: 'Cashless hospitalization; helps reduce out-of-pocket healthcare expenditure.',
    category: 'insurance',
    icon: <Shield size={24} color="#8b5cf6" />,
    color: '#8b5cf6',
    agency: 'National Health Authority',
  },
  {
    id: '4',
    name: 'Universal Immunisation Programme (UIP)',
    description: 'Free vaccination of children and pregnant women against vaccine-preventable diseases.',
    keyBenefits: 'Includes diseases like TB, diphtheria, pertussis, polio, measles, hepatitis B, others.',
    category: 'immunization',
    icon: <Heart size={24} color="#f59e0b" />,
    color: '#f59e0b',
    agency: 'Ministry of Health',
  },
  {
    id: '5',
    name: 'Mission Indradhanush',
    description: 'Accelerate full immunization coverage for children and pregnant women.',
    keyBenefits: 'Targets areas with low immunization; aims to cover children who were left out.',
    category: 'immunization',
    icon: <Heart size={24} color="#ef4444" />,
    color: '#ef4444',
    agency: 'Ministry of Health',
  },
  {
    id: '6',
    name: 'Janani Shishu Suraksha Karyakaram (JSSK)',
    description: 'Maternal & child health: ensuring free services for pregnant women & sick newborns/babies.',
    keyBenefits: 'Free drugs, diagnostics, transport to/from health facility, diet, etc.',
    category: 'maternal',
    icon: <Baby size={24} color="#ec4899" />,
    color: '#ec4899',
    agency: 'Ministry of Health',
  },
  {
    id: '7',
    name: 'Janani Suraksha Yojana (JSY)',
    description: 'Promoting institutional delivery among poorer mothers.',
    keyBenefits: 'Incentives for mothers to deliver in medical institutions, reduce maternal mortality.',
    category: 'maternal',
    icon: <Baby size={24} color="#f97316" />,
    color: '#f97316',
    agency: 'Ministry of Health',
  },
  {
    id: '8',
    name: 'Rashtriya Bal Swasthya Karyakram (RBSK)',
    description: 'Child health screening & early intervention.',
    keyBenefits: 'Screening for birth defects, diseases, deficiencies, developmental delays.',
    category: 'child',
    icon: <Users size={24} color="#06b6d4" />,
    color: '#06b6d4',
    agency: 'Ministry of Health',
  },
  {
    id: '9',
    name: 'Rashtriya Kishor Swasthya Karyakram (RKSK)',
    description: 'Adolescent health programme.',
    keyBenefits: 'Focus on mental health, nutrition, sexual & reproductive health, and preventive care.',
    category: 'child',
    icon: <Users size={24} color="#84cc16" />,
    color: '#84cc16',
    agency: 'Ministry of Health',
  },
  {
    id: '10',
    name: 'National Health Mission (NHM)',
    description: 'Umbrella mission to improve health infrastructure in rural and urban areas.',
    keyBenefits: 'Strengthen primary health centers, reduce mortality rates, disease control etc.',
    category: 'general',
    icon: <Heart size={24} color="#6366f1" />,
    color: '#6366f1',
    agency: 'Ministry of Health',
  },
  {
    id: '11',
    name: 'Pradhan Mantri Swasthya Suraksha Yojana (PMSSY)',
    description: 'To correct imbalances in health infrastructure & provide super specialty facilities in states.',
    keyBenefits: 'Establishment of AIIMS-like institutions and upgradation of government medical colleges.',
    category: 'general',
    icon: <Heart size={24} color="#7c3aed" />,
    color: '#7c3aed',
    agency: 'Ministry of Health',
  },
  {
    id: '12',
    name: 'Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP)',
    description: 'Access to generic (low-cost) medicines through government-run "Jan Aushadhi Kendras."',
    keyBenefits: 'Quality generic medicines at affordable prices, significant cost savings for patients.',
    category: 'general',
    icon: <Heart size={24} color="#059669" />,
    color: '#059669',
    agency: 'Department of Pharmaceuticals',
  },
];

// Category filter options
const categoryFilters = [
  { key: 'all', label: 'All Schemes', color: '#6b7280' },
  { key: 'insurance', label: 'Insurance', color: '#10b981' },
  { key: 'maternal', label: 'Maternal Health', color: '#ec4899' },
  { key: 'child', label: 'Child Health', color: '#06b6d4' },
  { key: 'immunization', label: 'Immunization', color: '#f59e0b' },
  { key: 'general', label: 'General Health', color: '#6366f1' },
];

// Individual scheme card component
const SchemeCard = ({ scheme }: { scheme: HealthScheme }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.schemeCard, { borderLeftColor: scheme.color }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.schemeHeader}>
        <View style={styles.schemeIconContainer}>
          {scheme.icon}
        </View>
        <View style={styles.schemeHeaderText}>
          <Text style={styles.schemeName} numberOfLines={expanded ? undefined : 2}>
            {scheme.name}
          </Text>
          {scheme.agency && (
            <Text style={styles.schemeAgency}>{scheme.agency}</Text>
          )}
        </View>
        <View style={styles.expandIcon}>
          <Text style={styles.expandText}>{expanded ? '−' : '+'}</Text>
        </View>
      </View>

      <Text style={styles.schemeDescription} numberOfLines={expanded ? undefined : 2}>
        {scheme.description}
      </Text>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.benefitsLabel}>Key Benefits:</Text>
          <Text style={styles.benefitsText}>{scheme.keyBenefits}</Text>
          
          <TouchableOpacity style={[styles.learnMoreButton, { backgroundColor: scheme.color }]}>
            <ExternalLink size={16} color="#fff" />
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Main component
export default function GovernmentSchemesScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter schemes based on search and category
  const filteredSchemes = governmentSchemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.keyBenefits.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Government Health Schemes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categoryFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.categoryButton,
              selectedCategory === filter.key && {
                backgroundColor: filter.color,
              },
            ]}
            onPress={() => setSelectedCategory(filter.key)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === filter.key && styles.categoryButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schemes List */}
      <ScrollView style={styles.schemesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.schemesHeader}>
          <Text style={styles.schemesTitle}>
            Major National Health Schemes & Programmes
          </Text>
          <Text style={styles.schemesCount}>
            {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {filteredSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}

        {filteredSchemes.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No schemes found matching your search criteria.
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search or category filter.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingBottom: 0,
    marginBottom: -8,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    alignSelf: 'flex-start',
    minWidth: 60,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  schemesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -16,
  },
  schemesHeader: {
    paddingVertical: 0,
    paddingTop: 16,
    marginBottom: 8,
  },
  schemesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  schemesCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schemeIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  schemeHeaderText: {
    flex: 1,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  schemeAgency: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  expandIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginLeft: 12,
  },
  expandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  benefitsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  benefitsText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  noResultsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});