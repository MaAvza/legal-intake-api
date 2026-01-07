function App() {
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          TailwindCSS v3 Working!
        </h1>
        <p className="text-gray-600 mb-6">
          Setup complete. Ready to build!
        </p>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
