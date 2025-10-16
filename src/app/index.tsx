import { Image, StyleSheet, Text, View, Animated, Dimensions, Alert, ScrollView, ImageBackground } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { InputField } from '../components/InputField';
import { MultiInputField } from '../components/MultiInputField';
import { Button } from '../components/Button';
import { theme } from '../utils/Theme';
import { router } from "expo-router"
import { signUp, signIn, signOut } from '../utils/firebaseAuth';
import {hp, wp} from '../utils/Responsive'

const { width: screenWidth } = Dimensions.get('window');

const authenticationscreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Demo state for the new components
  const [interests, setInterests] = useState<string[]>([]);

  const slideOut = useRef(new Animated.Value(0)).current; 
  const slideIn = useRef(new Animated.Value(screenWidth)).current;

  const slideLeftAnimation = () => {
    setIsSignUp(true);
    Animated.parallel([
      Animated.timing(slideOut, {
        toValue: -screenWidth,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  };

  const slideRightAnimation = () => {
    setIsSignUp(false);
    Animated.parallel([
      Animated.timing(slideOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideIn, {
        toValue: screenWidth,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isSignUp && !formData.name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const user = await signUp(formData.email, formData.password, formData.name);
        Alert.alert('Success', 'Account created successfully!');
        router.push('/(tabs)/');
      } else {
        const user = await signIn(formData.email, formData.password);
        router.push('/(tabs)/');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.4)']}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>✈️</Text>
            </View>
            <Text style={styles.title}>Welcome to PlanSync</Text>
            <Text style={styles.subtitle}>Plan your perfect trip</Text>
          </View>
      
      {/* Login Form */}
      <Animated.View style={[styles.formContainer, { transform: [{ translateX: slideOut }] }]}>
        <Text style={styles.formTitle}>Sign In</Text>
        <InputField 
          label="Email" 
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
          labelStyle={styles.inputLabel}
        />
        <InputField 
          label="Password" 
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
          secureTextEntry 
          labelStyle={styles.inputLabel}
        />
        <Button 
          title="Sign In" 
          onPress={handleAuth}
          loading={loading && !isSignUp}
          style={styles.authButton}
        />

        <Text style={styles.switchText}>
          Don't have an account? 
          <Text style={styles.switchLink} onPress={slideLeftAnimation}> Sign up</Text>
        </Text>
      </Animated.View>
      
      {/* Sign Up Form */}
      <Animated.View style={[styles.formContainerAbsolute, { transform: [{ translateX: slideIn }] }]}>
        <Text style={styles.formTitle}>Create Account</Text>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentFields}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <InputField 
            label="Full Name" 
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            autoCapitalize="words"
            labelStyle={styles.inputLabel}
          />
          <InputField 
            label="Email" 
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            labelStyle={styles.inputLabel}
          />
          <InputField 
            label="Password" 
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry 
            labelStyle={styles.inputLabel}
          />
          <InputField 
            label="Confirm Password" 
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry 
            labelStyle={styles.inputLabel}
          />
          
          {/* Demo Components */}
          <MultiInputField
            label="Travel Interests"
            values={interests}
            onValuesChange={setInterests}
            placeholder="Add your interests..."
            maxItems={5}
          />
        </ScrollView>
        
        <View style={styles.formFooter}>
          <Button 
            title="Create Account" 
            onPress={handleAuth}
            loading={loading && isSignUp}
            style={styles.authButton}
          />
          
          <Text style={styles.switchText}>
            Already have an account? 
            <Text style={styles.switchLink} onPress={slideRightAnimation}> Sign in</Text>
          </Text>
        </View>
      </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  )
}

export default authenticationscreen

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 70,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainerAbsolute: {
    position: 'absolute',
    top: hp(30),
    left: 0,
    right: 0,
    bottom: hp(10),
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    minHeight: 450,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentFields: {
    paddingVertical: 10,
  },
  formFooter: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  authButton: {
    marginTop: 20,
    marginBottom: 30,
  },
  switchText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  switchLink: {
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  inputLabel: {
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})