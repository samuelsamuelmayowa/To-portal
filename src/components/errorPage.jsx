import { useNavigate } from 'react-router-dom'
import NavBar from './NavBar';
import Footer from './Footer';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <div className='min-h-screen flex justify-center items-center'>
        <div className='text-center'>
            <p className='md:text-3xl font-semibold md:font-black cursor-pointer mb-2'>No page Found</p>
            <p onClick={()=> navigate(-1)} className='underline text-blue-600'>
              Go Back
            </p>
        </div>
      </div>
      <Footer black="bg-black text-white" />
    </>
  )
}

export default ErrorPage;