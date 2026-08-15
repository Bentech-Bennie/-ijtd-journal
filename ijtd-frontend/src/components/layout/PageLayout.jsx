import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const PageLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PageLayout