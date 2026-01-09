import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-gray-400">404</CardTitle>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
