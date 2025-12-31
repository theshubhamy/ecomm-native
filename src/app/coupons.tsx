import ScrollView from '@/components/ScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchOffers,
  validatePromoCode,
  Offer,
} from '@/store/slices/offersSlice';
import { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedPressable } from '@/components/ThemedPressable';

export default function Coupons() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { offers, isLoading, error } = useAppSelector(state => state.offers);
  const { total } = useAppSelector(state => state.cart);
  const [applyingCoupon, setApplyingCoupon] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  const calculateDiscountAmount = (offer: Offer): number => {
    if (offer.min_order_amount && total < offer.min_order_amount) {
      return 0;
    }

    let discount = 0;
    if (offer.discount_type === 'percentage') {
      discount = (total * offer.discount_value) / 100;
      if (offer.max_discount && discount > offer.max_discount) {
        discount = offer.max_discount;
      }
    } else {
      discount = offer.discount_value;
    }

    return Math.min(discount, total);
  };

  const handleApplyCoupon = async (offer: Offer) => {
    if (offer.min_order_amount && total < offer.min_order_amount) {
      Alert.alert(
        'Minimum Order Required',
        `This coupon requires a minimum order of ₹${offer.min_order_amount.toFixed(
          0,
        )}. Your current cart total is ₹${total.toFixed(0)}.`,
      );
      return;
    }

    setApplyingCoupon(offer.id);
    try {
      const result = await dispatch(validatePromoCode(offer.promo_code || ''));
      if (validatePromoCode.fulfilled.match(result)) {
        Alert.alert('Success', 'Coupon applied successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          (result.payload as string) || 'Failed to apply coupon',
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ThemedView
      style={{
        ...styles.container,
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <HeaderView>
        <ThemedView style={styles.header}>
          <ThemedPressable onPress={() => router.back()}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={Colors[colorScheme].textPrimary}
            />
          </ThemedPressable>
          <ThemedText type="subtitle">Available Coupons</ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>
      </HeaderView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          {isLoading ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="small">Loading coupons...</ThemedText>
            </ThemedView>
          ) : error ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="subtitle" style={{ color: Colors.error }}>
                Error loading coupons
              </ThemedText>
              <ThemedText type="small" style={{ marginTop: 8 }}>
                {error}
              </ThemedText>
            </ThemedView>
          ) : offers.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol
                name="tag"
                size={64}
                color={Colors[colorScheme].textSecondary}
              />
              <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                No coupons available
              </ThemedText>
              <ThemedText
                type="small"
                style={{
                  marginTop: 8,
                  textAlign: 'center',
                  color: Colors[colorScheme].textSecondary,
                }}
              >
                Check back later for exciting offers!
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {offers.length} {offers.length === 1 ? 'Coupon' : 'Coupons'}{' '}
                Available
              </ThemedText>
              {offers.map(offer => {
                const discountAmount = calculateDiscountAmount(offer);
                const isEligible =
                  !offer.min_order_amount || total >= offer.min_order_amount;
                const isExpired = new Date(offer.valid_until) < new Date();

                return (
                  <ThemedView
                    key={offer.id}
                    style={[
                      styles.couponCard,
                      {
                        backgroundColor: Colors[colorScheme].backgroundPaper,
                        opacity: isExpired ? 0.6 : 1,
                      },
                    ]}
                  >
                    <ThemedView style={styles.couponContent}>
                      <ThemedView style={styles.couponHeader}>
                        <ThemedView style={styles.couponHeaderLeft}>
                          <ThemedView
                            style={[
                              styles.discountBadge,
                              { backgroundColor: Colors.primary },
                            ]}
                          >
                            <ThemedText
                              type="small"
                              style={{ color: Colors.black, fontWeight: '700' }}
                            >
                              {offer.discount_type === 'percentage'
                                ? `${offer.discount_value}% OFF`
                                : `₹${offer.discount_value} OFF`}
                            </ThemedText>
                          </ThemedView>
                          {offer.promo_code && (
                            <ThemedView
                              style={[
                                styles.promoCodeBadge,
                                {
                                  backgroundColor: Colors.primary + '15',
                                  borderColor: Colors.primary,
                                },
                              ]}
                            >
                              <ThemedText
                                type="small"
                                style={{
                                  color: Colors.primary,
                                }}
                              >
                                {offer.promo_code}
                              </ThemedText>
                            </ThemedView>
                          )}
                        </ThemedView>
                        <ThemedButton
                          onPress={() => handleApplyCoupon(offer)}
                          disabled={
                            !isEligible ||
                            isExpired ||
                            applyingCoupon === offer.id ||
                            !offer.promo_code
                          }
                          style={[
                            styles.applyButton,
                            {
                              backgroundColor:
                                isEligible && !isExpired
                                  ? Colors.primary
                                  : Colors[colorScheme].textSecondary + '30',
                              opacity: isEligible && !isExpired ? 1 : 0.5,
                            },
                          ]}
                        >
                          {applyingCoupon === offer.id ? (
                            <ThemedText
                              type="small"
                              style={{ color: Colors.black, fontWeight: '600' }}
                            >
                              Applying...
                            </ThemedText>
                          ) : isExpired ? (
                            <ThemedText
                              type="small"
                              style={{ color: Colors.black, fontWeight: '600' }}
                            >
                              Expired
                            </ThemedText>
                          ) : isEligible ? (
                            <ThemedText
                              type="small"
                              style={{ color: Colors.black, fontWeight: '600' }}
                            >
                              Apply
                            </ThemedText>
                          ) : (
                            <ThemedText
                              type="small"
                              style={{ color: Colors.black, fontWeight: '600' }}
                            >
                              Not Eligible
                            </ThemedText>
                          )}
                        </ThemedButton>
                      </ThemedView>

                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.couponTitle}
                      >
                        {offer.title || 'Special Offer'}
                      </ThemedText>

                      {offer.description && (
                        <ThemedText
                          type="small"
                          style={[
                            styles.couponDescription,
                            { color: Colors[colorScheme].textSecondary },
                          ]}
                        >
                          {offer.description}
                        </ThemedText>
                      )}

                      <ThemedView style={styles.benefitsContainer}>
                        {discountAmount > 0 && (
                          <ThemedView style={styles.benefitRow}>
                            <IconSymbol
                              name="checkmark.circle.fill"
                              size={16}
                              color={Colors.success}
                            />
                            <ThemedText
                              type="xsmall"
                              style={styles.benefitText}
                            >
                              Save up to ₹{discountAmount.toFixed(0)} on this
                              order
                            </ThemedText>
                          </ThemedView>
                        )}
                        {offer.min_order_amount && (
                          <ThemedView style={styles.benefitRow}>
                            <IconSymbol
                              name={
                                isEligible
                                  ? 'checkmark.circle.fill'
                                  : 'exclamationmark.circle.fill'
                              }
                              size={16}
                              color={
                                isEligible ? Colors.success : Colors.warning
                              }
                            />
                            <ThemedText
                              type="xsmall"
                              style={[
                                styles.benefitText,
                                {
                                  color: isEligible
                                    ? Colors[colorScheme].textPrimary
                                    : Colors.warning,
                                },
                              ]}
                            >
                              Min. order: ₹{offer.min_order_amount.toFixed(0)}
                              {!isEligible &&
                                ` (Add ₹${(
                                  offer.min_order_amount - total
                                ).toFixed(0)} more)`}
                            </ThemedText>
                          </ThemedView>
                        )}
                        {offer.max_discount &&
                          offer.discount_type === 'percentage' && (
                            <ThemedView style={styles.benefitRow}>
                              <IconSymbol
                                name="checkmark.circle.fill"
                                size={16}
                                color={Colors.success}
                              />
                              <ThemedText
                                type="xsmall"
                                style={styles.benefitText}
                              >
                                Maximum discount: ₹
                                {offer.max_discount.toFixed(0)}
                              </ThemedText>
                            </ThemedView>
                          )}
                        <ThemedView style={styles.benefitRow}>
                          <IconSymbol
                            name="calendar"
                            size={16}
                            color={Colors[colorScheme].textSecondary}
                          />
                          <ThemedText
                            type="xsmall"
                            style={[
                              styles.benefitText,
                              { color: Colors[colorScheme].textSecondary },
                            ]}
                          >
                            Valid until {formatDate(offer.valid_until)}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                );
              })}
            </>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  couponCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  couponImage: {
    width: '100%',
    height: 120,
  },
  couponContent: {
    padding: 20,
    gap: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  couponHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promoCodeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  couponTitle: {
    fontSize: 18,
    marginTop: 4,
  },
  couponDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  benefitsContainer: {
    gap: 10,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '20',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  applyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
});
