import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-error-600">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="text-left text-sm text-gray-500 dark:text-gray-400">
                  <summary>Error details</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}