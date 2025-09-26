import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { theme } from '../utils/Theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'focus' | 'error';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  size = 'md',
  variant = 'default',
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine the current variant based on state and props
  const currentVariant = error ? 'error' : isFocused ? 'focus' : variant;
  const inputVariant = theme.components.input.variants[currentVariant];
  const inputSize = theme.components.input.sizes[size];
  
  const containerStyles: ViewStyle = {
    marginBottom: theme.spacing.md,
    ...containerStyle,
  };
  
  const inputStyles: TextStyle = {
    ...inputSize,
    backgroundColor: inputVariant.backgroundColor,
    borderColor: inputVariant.borderColor,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    color: inputVariant.color,
    fontFamily: theme.typography.fontFamily.primary,
    ...inputStyle,
  };
  
  const labelStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    ...labelStyle,
  };
  
  const errorStyles: TextStyle = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.error[500],
    marginTop: theme.spacing.xs,
    ...errorStyle,
  };
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      <TextInput
        style={inputStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={theme.colors.text.tertiary}
        {...props}
      />
      {error && <Text style={errorStyles}>{error}</Text>}
    </View>
  );
};