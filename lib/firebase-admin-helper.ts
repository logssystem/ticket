import { initializeApp, getApps, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/**
 * Cria um usuário no Firebase Auth usando um app secundário,
 * assim o admin logado não é desconectado.
 */
export async function criarUsuarioSemDeslogar(
  email: string,
  senha: string,
  dados: Record<string, any>
): Promise<string> {
  // Cria app secundário temporário
  const appSecundario = initializeApp(firebaseConfig, `secondary-${Date.now()}`)
  const authSecundario = getAuth(appSecundario)
  const dbSecundario = getFirestore(appSecundario)

  try {
    const { user } = await createUserWithEmailAndPassword(authSecundario, email, senha)
    await setDoc(doc(dbSecundario, 'usuarios', user.uid), {
      ...dados,
      uid: user.uid,
    })
    return user.uid
  } finally {
    // Sempre deleta o app secundário ao final
    await deleteApp(appSecundario)
  }
}
