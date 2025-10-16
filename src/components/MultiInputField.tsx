import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../utils/Theme';

interface MultiInputFieldProps {
  label: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  minItems?: number;
  editable?: boolean;
}

export const MultiInputField: React.FC<MultiInputFieldProps> = ({
  label,
  values,
  onValuesChange,
  placeholder = "Enter item...",
  maxItems = 10,
  minItems = 0,
  editable = true,
}) => {
  const [currentInput, setCurrentInput] = useState('');

  const addItem = () => {
    if (currentInput.trim() && values.length < maxItems && !values.includes(currentInput.trim())) {
      const newValues = [...values, currentInput.trim()];
      onValuesChange(newValues);
      setCurrentInput('');
    }
  };

  const removeItem = (index: number) => {
    if (values.length > minItems) {
      const newValues = values.filter((_, i) => i !== index);
      onValuesChange(newValues);
    }
  };

  const handleKeyPress = (text: string) => {
    if (text.endsWith(',') || text.endsWith('\n')) {
      const cleanText = text.slice(0, -1).trim();
      if (cleanText && values.length < maxItems && !values.includes(cleanText)) {
        const newValues = [...values, cleanText];
        onValuesChange(newValues);
        setCurrentInput('');
      }
    } else {
      setCurrentInput(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Current Tags/Items */}
      {values.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {values.map((value, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{value}</Text>
              {editable && (
                <TouchableOpacity 
                  onPress={() => removeItem(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        !editable && (
          <Text style={styles.emptyText}>{placeholder}</Text>
        )
      )}

      {/* Input Field - only show when editable */}
      {editable && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={currentInput}
            onChangeText={handleKeyPress}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.tertiary}
            onSubmitEditing={addItem}
            blurOnSubmit={false}
            returnKeyType="done"
          />
          
          {currentInput.trim() && values.length < maxItems && (
            <TouchableOpacity onPress={addItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {editable && (
        <Text style={styles.helperText}>
          {values.length}/{maxItems} items • Press comma or enter to add
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  tagsContainer: {
    marginBottom: theme.spacing.sm,
    maxHeight: 60,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[700],
    marginRight: theme.spacing.xs,
  },
  removeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
  addButton: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
  },
});