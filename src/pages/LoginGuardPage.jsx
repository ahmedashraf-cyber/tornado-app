export default function LoginGuardPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-tornado-red rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <p className="text-gray-600 text-sm font-medium">Please login using the Login window</p>
      </div>
    </div>
  )
}
