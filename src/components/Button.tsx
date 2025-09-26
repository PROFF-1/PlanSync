import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../utils/Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonVariant = theme.components.button.variants[variant];
  const buttonSize = theme.components.button.sizes[size];
  
  const buttonStyles: ViewStyle = {
    ...buttonSize,
    backgroundColor: disabled ? theme.colors.neutral[300] : buttonVariant.backgroundColor,
    borderColor: disabled ? theme.colors.neutral[300] : buttonVariant.borderColor,
    borderWidth: variant === 'secondary' ? 1 : 0,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...style,
  };
  
  const textStyles: TextStyle = {
    fontSize: buttonSize.fontSize,
    fontWeight: '600' as any,
    color: disabled ? theme.colors.text.tertiary : buttonVariant.color,
    fontFamily: theme.typography.fontFamily.primary,
    ...textStyle,
  };
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={disabled ? theme.colors.text.tertiary : buttonVariant.color}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};