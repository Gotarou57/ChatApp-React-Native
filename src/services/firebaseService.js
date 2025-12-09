import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const MESSAGES_COLLECTION = 'messages';

// Upload gambar ke Firebase Storage
export const uploadImage = async (imageUri, username) => {
  try {
    const filename = `${username}_${Date.now()}.jpg`;
    const reference = storage().ref(`chat_images/${filename}`);

    await reference.putFile(imageUri);
    const downloadURL = await reference.getDownloadURL();

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Kirim pesan teks
export const sendMessage = async (username, text) => {
  try {
    await firestore().collection(MESSAGES_COLLECTION).add({
      username: username,
      text: text,
      type: 'text',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

// Kirim pesan dengan gambar
export const sendImageMessage = async (username, imageUrl) => {
  try {
    await firestore().collection(MESSAGES_COLLECTION).add({
      username: username,
      imageUrl: imageUrl,
      type: 'image',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error sending image message:', error);
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
