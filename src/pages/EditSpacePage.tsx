import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSpace, updateSpace } from '../store/useSpaces'
import { SpaceForm } from '../components/SpaceForm'

export function EditSpacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { space, loaded } = useSpace(id)

  if (!loaded) {
    return <p className="p-4 text-center text-sm">Chargement...</p>
  }
  if (!space) {
    return (
      <div className="flex flex-col items-center gap-3 p-6">
        <p>Cette parcelle n'existe plus.</p>
        <Link to="/" className="village-btn village-btn-primary px-4 py-2 text-sm">
          Retour au village
        </Link>
      </div>
    )
  }

  return (
    <SpaceForm
      title="✏️ Corriger la parcelle"
      initial={space}
      submitLabel="💾 Enregistrer"
      savingLabel="Enregistrement..."
      onCancel={() => navigate(`/room/${id}`)}
      onSubmit={async (data) => {
        await updateSpace(space.id, data)
        navigate(`/room/${id}`)
      }}
    />
  )
}
