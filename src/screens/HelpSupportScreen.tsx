import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, BookOpen, Video, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const HelpSupportScreen = () => {
  const navigation = useNavigation();

  const handleContactSupport = (method: string) => {
    switch (method) {
      case 'phone':
        Linking.openURL('tel:1800-XXX-XXXX');
        break;
      case 'email':
        Linking.openURL('mailto:support@sehatconnect.in');
        break;
      case 'chat':
        // Open chat support
        console.log('Opening chat support');
        break;
    }
  };

  const FAQItem = ({ question, answer }: any) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <HelpCircle size={48} color="#5a9e31" strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Get quick answers to your questions or reach out to our support team
          </Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT US</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactSupport('phone')}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Phone size={28} color="#1976d2" strokeWidth={2} />
              </View>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSubtitle}>24/7 Support</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactSupport('chat')}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#f0f7ed' }]}>
                <MessageCircle size={28} color="#5a9e31" strokeWidth={2} />
              </View>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactSubtitle}>Quick Response</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactSupport('email')}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#fef3f2' }]}>
                <Mail size={28} color="#ef4444" strokeWidth={2} />
              </View>
              <Text style={styles.contactTitle}>Email</Text>
              <Text style={styles.contactSubtitle}>Within 24 hrs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK LINKS</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
              <View style={styles.linkLeft}>
                <BookOpen size={22} color="#5a9e31" strokeWidth={2} />
                <Text style={styles.linkTitle}>User Guide</Text>
              </View>
              <ChevronRight size={20} color="#999" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
              <View style={styles.linkLeft}>
                <Video size={22} color="#3b82f6" strokeWidth={2} />
                <Text style={styles.linkTitle}>Video Tutorials</Text>
              </View>
              <ChevronRight size={20} color="#999" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
              <View style={styles.linkLeft}>
                <HelpCircle size={22} color="#8b5cf6" strokeWidth={2} />
                <Text style={styles.linkTitle}>FAQs</Text>
              </View>
              <ChevronRight size={20} color="#999" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Common FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={styles.card}>
            <FAQItem
              question="How do I book an appointment?"
              answer="Go to the Consult tab, select your preferred doctor, choose a time slot, and confirm your booking."
            />
            <View style={styles.divider} />
            <FAQItem
              question="How can I access my medical records?"
              answer="Navigate to the Records tab to view, download, or share your complete medical history."
            />
            <View style={styles.divider} />
            <FAQItem
              question="Is my health data secure?"
              answer="Yes, we use industry-standard encryption and comply with all healthcare data protection regulations."
            />
            <View style={styles.divider} />
            <FAQItem
              question="How do I link my ABHA ID?"
              answer="Go to Profile > ABDM Integration and enter your 14-digit ABHA ID to link your account."
            />
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.supportHoursCard}>
          <Text style={styles.supportHoursTitle}>Support Hours</Text>
          <Text style={styles.supportHoursText}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
          <Text style={styles.supportHoursText}>Saturday: 10:00 AM - 4:00 PM</Text>
          <Text style={styles.supportHoursText}>Sunday: Closed</Text>
          <Text style={styles.supportHoursNote}>Emergency support available 24/7</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  faqItem: {
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  supportHoursCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
  },
  supportHoursTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 12,
  },
  supportHoursText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 6,
  },
  supportHoursNote: {
    fontSize: 13,
    color: '#1976d2',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
