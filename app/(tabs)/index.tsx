import ScrollView from '@/components/ScrollView';
import TopBar from '@/components/TopBar';

export default function HomeScreen() {
  return (
    <ScrollView backgroundColor={{ light: '#f5f5f5f5', dark: '#050505' }}>
      <TopBar />
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });
