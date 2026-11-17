import { useEffect, useState } from 'react'
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export default function App() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [list, setList] = useState([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'), limit(50))
    return onSnapshot(q,
      (snap) => setList(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => setNotice('글을 불러오지 못했어요: ' + err.code))
  }, [])

  async function save(e) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) { setNotice('별명과 메시지를 모두 써 주세요.'); return }
    setBusy(true); setNotice('')
    try {
      await addDoc(collection(db, 'guestbook'), {
        name: name.trim(), message: message.trim(), createdAt: serverTimestamp(),
      })
      setMessage('')
    } catch (err) {
      setNotice('저장하지 못했어요: ' + err.code)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="wrap">
      <h1>홍천 우리 반 방명록</h1>
      <p className="sub">별명과 한 줄 인사를 남겨 주세요. 실명·전화번호는 쓰지 마세요.</p>
      <form onSubmit={save} className="card">
        <input value={name} maxLength={10} onChange={(e) => setName(e.target.value)} placeholder="별명 (10자까지)" />
        <input value={message} maxLength={50} onChange={(e) => setMessage(e.target.value)} placeholder="한 줄 메시지 (50자까지)" />
        <button disabled={busy}>{busy ? '남기는 중…' : '남기기'}</button>
      </form>
      {notice && <p className="notice">{notice}</p>}
      <ul className="list">
        {list.map((it) => (
          <li key={it.id}><b>{it.name}</b><span>{it.message}</span></li>
        ))}
        {list.length === 0 && <li className="empty">아직 남긴 글이 없어요. 첫 글을 남겨 보세요!</li>}
      </ul>
    </main>
  )
}
