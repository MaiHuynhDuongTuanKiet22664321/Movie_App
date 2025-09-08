import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../theme/theme';

const PaymentMethodItem = ({ method, isSelected, onSelect } :any) => {
  return (
    <TouchableOpacity
      style={[
        styles.paymentMethodItem,
        isSelected && styles.selectedPaymentMethod,
      ]}
      onPress={() => onSelect(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodLeft}>
          {method.image && (
            <Image source={method.image} style={styles.paymentMethodImage} />
          )}
          {!method.image && (
            <View style={styles.paymentMethodPlaceholder}>
              <Text style={styles.placeholderText}>💳</Text>
            </View>
          )}
          <View style={styles.paymentMethodText}>
            <Text style={styles.paymentMethodName}>{method.name}</Text>
            <Text style={styles.paymentMethodDescription}>
              {method.description}
            </Text>
          </View>
        </View>
        
        {/* Radio button */}
        <View style={styles.radioButton}>
          <View
            style={[
              styles.radioButtonOuter,
              isSelected && styles.radioButtonOuterSelected,
            ]}
          >
            {isSelected && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  paymentMethodItem: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: SPACING.space_12,
    padding: SPACING.space_16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedPaymentMethod: {
    borderColor: COLORS.Orange,
    backgroundColor: COLORS.Grey,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentMethodImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    borderRadius: SPACING.space_8,
  },
  paymentMethodPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.Grey,
    borderRadius: SPACING.space_8,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 20,
  },
  paymentMethodText: {
    marginLeft: SPACING.space_12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.White,
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: COLORS.WhiteRGBA50,
  },
  radioButton: {
    marginLeft: SPACING.space_12,
  },
  radioButtonOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA50,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonOuterSelected: {
    borderColor: COLORS.Orange,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.Orange,
  },
});

export default PaymentMethodItem;