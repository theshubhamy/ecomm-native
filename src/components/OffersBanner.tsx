import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ThemedPressable } from './ThemedPressable';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppSelector } from '@/store/hooks';
import { Offer } from '@/store/slices/offersSlice';
import { Image } from 'expo-image';
import { StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

interface OffersBannerProps {
  onOfferPress?: (offer: Offer) => void;
}

export default function OffersBanner({ onOfferPress }: OffersBannerProps) {
  const colorScheme = useColorScheme();
  const { activeOffers } = useAppSelector((state) => state.offers);

  if (activeOffers.length === 0) {
    return null;
  }

  const handleOfferPress = (offer: Offer) => {
    if (onOfferPress) {
      onOfferPress(offer);
    } else {
      router.push('/(tabs)/catalog');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeOffers.slice(0, 5).map((offer) => (
          <ThemedPressable
            key={offer.id}
            onPress={() => handleOfferPress(offer)}
            style={[
              styles.offerCard,
              {
                backgroundColor: Colors.primary + '15',
                borderColor: Colors.primary + '30',
              },
            ]}
          >
            {offer.image_url && (
              <Image
                source={{ uri: offer.image_url }}
                style={styles.offerImage}
                contentFit="cover"
              />
            )}
            <ThemedView style={styles.offerContent}>
              <ThemedView style={styles.offerHeader}>
                <ThemedView
                  style={[
                    styles.discountBadge,
                    { backgroundColor: Colors.primary },
                  ]}
                >
                  <ThemedText
                    type="xsmall"
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
                      styles.promoBadge,
                      { backgroundColor: Colors[colorScheme].backgroundPaper },
                    ]}
                  >
                    <ThemedText
                      type="xsmall"
                      style={{
                        color: Colors.primary,
                        fontWeight: '600',
                      }}
                    >
                      {offer.promo_code}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
              <ThemedText
                type="defaultSemiBold"
                style={styles.offerTitle}
                numberOfLines={1}
              >
                {offer.title}
              </ThemedText>
              <ThemedText
                type="xsmall"
                style={{
                  color: Colors[colorScheme].textSecondary,
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                {offer.description}
              </ThemedText>
              {offer.min_order_amount && (
                <ThemedText
                  type="xsmall"
                  style={{
                    color: Colors[colorScheme].textSecondary,
                    marginTop: 4,
                  }}
                >
                  Min. order: ${offer.min_order_amount}
                </ThemedText>
              )}
            </ThemedView>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors.primary}
            />
          </ThemedPressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    minWidth: 280,
    gap: 12,
  },
  offerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  offerContent: {
    flex: 1,
    gap: 4,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  offerTitle: {
    fontSize: 14,
  },
});

