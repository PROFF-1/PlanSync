import { Image, StyleSheet, Text, View, Animated, Dimensions, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/planSync.png')} style={styles.logo} />
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
        />
        <InputField 
          label="Password" 
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
          secureTextEntry 
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
          />
          <InputField 
            label="Email" 
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField 
            label="Password" 
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry 
          />
          <InputField 
            label="Confirm Password" 
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry 
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
  )
}

export default authenticationscreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    marginTop: 20,
    marginBottom: 30,
  },
  switchText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  switchLink: {
    fontWeight: 'bold',
    color: theme.colors.primary[500],
  },
})