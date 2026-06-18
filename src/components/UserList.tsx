import { useState, useEffect } from 'react'
import { getUsers, deleteUser, loginAdmin, setAuthToken, type User } from '../services/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'sonner'

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e) {
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [isAdmin])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await loginAdmin(email, password)
      if (res.isAdmin) {
        setAuthToken(res.token)
        setIsAdmin(true)
        toast.success("Connecté en tant qu'admin")
      }
    } catch (e) {
      toast.error("Identifiants invalides")
    }
  }

  const handleLogout = () => {
    setAuthToken(null)
    setIsAdmin(false)
    setEmail('')
    setPassword('')
  }

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await deleteUser(id)
        toast.success("Utilisateur supprimé")
        fetchUsers()
      } catch (e) {
        toast.error("Erreur lors de la suppression")
      }
    }
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Inscrits {users.length > 0 && `(${users.length})`}
        </h2>
        {!isAdmin ? (
          <form onSubmit={handleLogin} className="flex gap-2">
            <Input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-32 h-8 text-xs" />
            <Input type="password" placeholder="Pass" value={password} onChange={e => setPassword(e.target.value)} className="w-24 h-8 text-xs" />
            <Button type="submit" size="sm" className="h-8">Login</Button>
          </form>
        ) : (
          <Button onClick={handleLogout} variant="outline" size="sm">Se déconnecter</Button>
        )}
      </div>

      {loading ? (
        <p className="mt-2 text-sm text-slate-500">Chargement...</p>
      ) : users.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Aucun inscrit pour le moment.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {users.map((user, index) => (
            <li
              key={user.id || index}
              className="flex flex-col gap-2 rounded-lg border p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-slate-500">{user.email}</span>
              </div>
              {isAdmin && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-slate-500">
                  <div>
                    <p>Ville: {user.city} ({user.postalCode})</p>
                    <p>Naissance: {user.birthDate}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>Supprimer</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
