import { db } from "../firebase/firebaseConfig.js";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

//const SERVER_URL = "https://coffeebot-70fh.onrender.com/chat";
const SERVER_URL = "http://127.0.0.1:5000/chat";

export async function getChatMessages(userId, chatId) {
  const docRef = doc(db, "users", userId, "chats", chatId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().messages || [];
  } else {
    return [];
  }
}

// Send message to your Python AI Server
export async function fetchAIResponse(message, sessionId) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("AI Server Error:", error);
    throw error;
  }
}

// Save message to Firestore
export async function saveMessage(userId, chatId, text, sender) {
  const chatsRef = collection(db, "users", userId, "chats");

  // If no chat ID, create new one (with limit check)
  if (!chatId) {
    const q = query(chatsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    // Enforce 3 chat limit logic
    if (snapshot.size >= 3) {
      const oldestDoc = snapshot.docs[snapshot.docs.length - 1];
      await deleteDoc(doc(db, "users", userId, "chats", oldestDoc.id));
    }

    const newChat = await addDoc(chatsRef, {
      title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
      timestamp: serverTimestamp(),
      messages: [{ text, sender }],
    });
    return newChat.id; // Return the new ID
  } else {
    // Update existing
    const chatDoc = doc(db, "users", userId, "chats", chatId);
    await updateDoc(chatDoc, {
      messages: arrayUnion({ text, sender }),
      timestamp: serverTimestamp(),
    });
    return chatId;
  }
}

// Subscribe to Recent Chats (Real-time listener)
// We pass a 'callback' function so the UI updates whenever DB changes
export function subscribeToRecentChats(userId, callback) {
  const chatsRef = collection(db, "users", userId, "chats");
  const q = query(chatsRef, orderBy("timestamp", "desc"), limit(3));

  return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
    const chats = [];
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    callback(chats, snapshot.empty);
  });
}

export async function deleteChatSession(userId, chatId) {
  await deleteDoc(doc(db, "users", userId, "chats", chatId));
}
