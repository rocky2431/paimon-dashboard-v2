import { useParams } from 'react-router-dom'

export default function RedemptionDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Redemption Details</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View redemption request #{id}
        </p>
      </div>

      <div className="card">
        <div className="p-6">
          <div className="h-64 flex items-center justify-center text-gray-500">
            [Redemption Detail for ID: {id}]
          </div>
        </div>
      </div>
    </div>
  )
}