import { useNavigate } from 'react-router-dom'
import { createSpace } from '../store/useSpaces'
import { SpaceForm } from '../components/SpaceForm'

export function NewSpacePage() {
  const navigate = useNavigate()

  return (
    <SpaceForm
      title="✨ Nouvelle parcelle"
      submitLabel="🏗️ Construire cette parcelle"
      savingLabel="Construction..."
      onSubmit={async (data) => {
        const space = await createSpace(data)
        navigate(`/room/${space.id}`)
      }}
    />
  )
}
