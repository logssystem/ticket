import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import fs from 'fs'

const firebaseConfig = {
  apiKey: "AIzaSyBYTDl1zGX4o9tmrqf5Vy_A6UXXhBCH-6U",
  authDomain: "era-tickets.firebaseapp.com",
  projectId: "era-tickets",
  storageBucket: "era-tickets.firebasestorage.app",
  messagingSenderId: "1094753839661",
  appId: "1:1094753839661:web:4603ad338cd316ddbe66a4",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// 1. Corrige tickets com clienteUid/clienteEmail null
console.log('1. Corrigindo tickets...')
const tSnap = await getDocs(collection(db, 'tickets'))
const uSnap = await getDocs(collection(db, 'usuarios'))

const usuarios = {}
uSnap.docs.forEach(d => { usuarios[d.id] = d.data() })

let corrigidos = 0
for (const d of tSnap.docs) {
  const data = d.data()
  if (!data.clienteUid || !data.clienteEmail) {
    // Tenta achar o cliente pelo nome
    const cliente = Object.entries(usuarios).find(([uid, u]) => u.role === 'cliente')
    if (cliente) {
      const [uid, u] = cliente
      await updateDoc(doc(db, 'tickets', d.id), {
        clienteUid: uid,
        clienteEmail: u.email,
        clienteNome: u.nome,
      })
      console.log(`   ✅ Ticket #${data.numero} → ${u.email}`)
      corrigidos++
    }
  }
}
console.log(`   ${corrigidos} ticket(s) corrigido(s)\n`)

// 2. Corrige o arquivo meus-tickets/page.tsx
console.log('2. Verificando meus-tickets/page.tsx...')
const pagePath = 'app/meus-tickets/page.tsx'
if (fs.existsSync(pagePath)) {
  const content = fs.readFileSync(pagePath, 'utf8')
  if (content.includes('[CONTEUDO]') || content.length < 1000) {
    console.log('   ⚠️  Arquivo com problema, será recriado pelo fix-meus-tickets.mjs')
  } else if (content.includes('b.abertoEm - a.abertoEm')) {
    const fixed = content.replace(
      '} as Ticket))).sort((a, b) => b.abertoEm - a.abertoEm)',
      '} as Ticket))'
    ).replace(
      'setTickets(dados)',
      'dados.sort((a,b) => b.abertoEm.getTime() - a.abertoEm.getTime()); setTickets(dados)'
    )
    fs.writeFileSync(pagePath, fixed, 'utf8')
    console.log('   ✅ Sintaxe corrigida!')
  } else {
    console.log('   ✅ Arquivo OK')
  }
}

console.log('\n✅ Tudo pronto! Rode pnpm dev e teste novamente.')
process.exit(0)
