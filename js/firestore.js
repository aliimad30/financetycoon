import {
  collection,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let db = null;
let uid = null;

function waitForFirebase() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.firebase?.db && window.firebase?.auth) {
        db = window.firebase.db;
        uid = window.firebase.auth.currentUser?.uid;
        if (uid) return resolve();
        window.firebase.auth.onAuthStateChanged((user) => {
          uid = user.uid;
          resolve();
        });
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export async function saveGame(gameState) {
  await waitForFirebase();
  const gameRef = doc(collection(db, "games"), uid);
  await setDoc(gameRef, {
    player: gameState.player,
    stocks: gameState.stocks,
    day: gameState.day
  });
}

export async function loadGame() {
  await waitForFirebase();
  const gameRef = doc(collection(db, "games"), uid);
  const snapshot = await getDoc(gameRef);
  return snapshot.exists() ? snapshot.data() : null;
}
