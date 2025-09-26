import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../utils/Theme';

interface PickerItem {
  label: string;
  value: string;
}

interface PickerFieldProps {
  label?: string;
  items: PickerItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const PickerField: React.FC<PickerFieldProps> = ({
  label,
  items,
  value,
  onValueChange,
  placeholder = 'Select an option',
  error,
  size = 'md',
  containerStyle,
  labelStyle,
  errorStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const inputSize = theme.components.input.sizes[size];
  const inputVariant = error ? 
    theme.components.input.variants.error : 
    theme.components.input.variants.default;
  
  const containerStyles: ViewStyle = {
    marginBottom: theme.spacing.md,
    ...containerStyle,
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
  
  const pickerContainerStyle: ViewStyle = {
    ...inputSize,
    backgroundColor: inputVariant.backgroundColor,
    borderColor: inputVariant.borderColor,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const selectedItem = items.find(item => item.value === value);
  const displayText = selectedItem ? selectedItem.label : placeholder;
  
  // iOS Modal Picker
  const renderIOSPicker = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.optionItem,
                  value === item.value && styles.selectedOption
                ]}
                onPress={() => {
                  onValueChange(item.value);
                  setModalVisible(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  value === item.value && styles.selectedOptionText
                ]}>
                  {item.label}
                </Text>
                {value === item.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Android Native Picker
  const renderAndroidPicker = () => (
    <View style={pickerContainerStyle}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={{
          color: inputVariant.color,
          height: inputSize.height,
        }}
        mode="dropdown"
      >
        <Picker.Item
          label={placeholder}
          value=""
          color={theme.colors.text.tertiary}
        />
        {items.map((item) => (
          <Picker.Item
            key={item.value}
            label={item.label}
            value={item.value}
            color={inputVariant.color}
          />
        ))}
      </Picker>
    </View>
  );

  // iOS Touchable Field
  const renderIOSField = () => (
    <TouchableOpacity
      style={[pickerContainerStyle, styles.iosPickerField]}
      onPress={() => setModalVisible(true)}
    >
      <Text style={[
        styles.iosPickerText,
        { color: selectedItem ? inputVariant.color : theme.colors.text.tertiary }
      ]}>
        {displayText}
      </Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      
      {Platform.OS === 'ios' ? (
        <>
          {renderIOSField()}
          {renderIOSPicker()}
        </>
      ) : (
        renderAndroidPicker()
      )}
      
      {error && <Text style={errorStyles}>{error}</Text>}
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
  },
  cancelButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.base,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  doneButton: {
    paddingVertical: theme.spacing.sm,
  },
  doneButtonText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  optionsList: {
    maxHeight: height * 0.4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary[50],
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  selectedOptionText: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  checkmark: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold as any,
  },
  iosPickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  iosPickerText: {
    fontSize: theme.typography.fontSize.base,
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.text.tertiary,
    transform: [{ rotate: '90deg' }],
  },
});