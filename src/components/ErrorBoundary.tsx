import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: any }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props){
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any){
    return { hasError: true, error }
  }
  componentDidCatch(error: any, info: any){
    console.error('App error:', error, info)
  }
  render(){
    if(this.state.hasError){
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-900 text-white p-6">
          <div className="max-w-lg text-center">
            <div className="text-2xl font-semibold mb-2">Something went wrong</div>
            <div className="text-sm text-zinc-300 mb-4">Please refresh the page. If the issue persists, re-extract the latest zip.</div>
            <pre className="text-xs text-zinc-400 bg-black/40 p-3 rounded-md overflow-auto">{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}