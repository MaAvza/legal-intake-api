import Header from './components/shared/Header'
import Hero from './components/shared/Hero'
import TicketForm from './components/forms/TicketForm'
import Footer from './components/shared/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <TicketForm />
      </main>
      
      <Footer />
    </div>
  )
}

export default App