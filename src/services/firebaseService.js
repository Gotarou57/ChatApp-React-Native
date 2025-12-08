import firestore from '@react-native-firebase/firestore';

const MESSAGES_COLLECTION = 'messages';

// Kirim pesan baru
export const sendMessage = async (username, text) => {
  try {
    await firestore().collection(MESSAGES_COLLECTION).add({
      username: username,
      text: text,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

// Subscribe ke perubahan pesan secara real-time
export const subscribeToMessages = callback => {
  const unsubscribe = firestore()
    .collection(MESSAGES_COLLECTION)
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      querySnapshot => {
        const messages = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            username: data.username,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        callback(messages);
      },
      error => {
        console.error('Error subscribing to messages:', error);
      },
    );

  return unsubscribe;
};
