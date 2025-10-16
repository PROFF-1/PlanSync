import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from 'react-native';
import { theme } from '../utils/Theme';

export interface SelectOption {
  id: string;
  label: string;
  value: string;
}

interface MultiSelectFieldProps {
  label: string;
  options: SelectOption[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  searchable?: boolean;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  maxSelections,
  searchable = true,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      // Remove from selection
      const newSelection = selectedValues.filter(value => value !== optionValue);
      onSelectionChange(newSelection);
    } else {
      // Add to selection if not at max limit
      if (maxSelections === undefined || selectedValues.length < maxSelections) {
        const newSelection = [...selectedValues, optionValue];
        onSelectionChange(newSelection);
      }
    }
  };

  const getSelectedLabels = () => {
    return options
      .filter(option => selectedValues.includes(option.value))
      .map(option => option.label);
  };

  const renderOption = ({ item }: { item: SelectOption }) => {
    const isSelected = selectedValues.includes(item.value);
    const isDisabled = Boolean(maxSelections && !isSelected && selectedValues.length >= maxSelections);

    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          isSelected && styles.optionItemSelected,
          isDisabled && styles.optionItemDisabled,
        ]}
        onPress={() => toggleOption(item.value)}
        disabled={isDisabled}
      >
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionText,
            isSelected && styles.optionTextSelected,
            isDisabled && styles.optionTextDisabled,
          ]}>
            {item.label}
          </Text>
          {isSelected && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedValues.length > 0 ? (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedText} numberOfLines={2}>
                {getSelectedLabels().join(', ')}
              </Text>
              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>{selectedValues.length}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
      </TouchableOpacity>

      {maxSelections && (
        <Text style={styles.helperText}>
          {selectedValues.length}/{maxSelections} selected
        </Text>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            {searchable && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search options..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            )}

            <FlatList
              data={filteredOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.id}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
  selector: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  selectedContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  selectedText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  selectedCount: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    marginLeft: theme.spacing.sm,
  },
  selectedCountText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  placeholderText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
  },
  dropdownIcon: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  closeButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  closeButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  searchInput: {
    margin: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  optionItemSelected: {
    backgroundColor: theme.colors.primary[50],
  },
  optionItemDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  optionTextSelected: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  optionTextDisabled: {
    color: theme.colors.text.tertiary,
  },
  checkmark: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary[600],
    fontWeight: 'bold',
  },
});