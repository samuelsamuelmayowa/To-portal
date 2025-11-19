import FetchContacts from "../hooks/FetchContacts";
import Loader from "./Loader";
import { useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import ServerErrorPage from "./ServerErrorPage";
import '@splidejs/react-splide/css';


const Contacts = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(10)
  const { data, isLoading, error } = FetchContacts()

  if (error) return <p className='text-center text-red-500 md:text-3xl font-black'>{error.message}</p>
  if (isLoading) return <Loader />
  if (data?.status === 500) return <ServerErrorPage />
  

  const lastPostIndex = currentPage * postsPerPage
  const firstPostIndex = lastPostIndex - postsPerPage
  const paginatedData = data?.data?.data?.slice(firstPostIndex, lastPostIndex)
  const length = data?.data?.response?.length || 1

  const pageNumber = []
  for (let i = 1; i <= Math.ceil((length) / postsPerPage); i++) {
      pageNumber.push(i)
  }

  return (
    <div className="md:p-5 rounded-xl overflow-hidden">
      <table className="rounded-md lg:rounded-none md:p-3 contact-table table-auto border-collapse w-full">
        <thead className="text-left md:font-black">
          <tr className="">
            <th className="text-sm md:text-base tracking-wide p-1 md:p-2">Date</th>
            <th className="text-sm md:text-base tracking-wide p-1 md:p-2">Name</th>
            <th className="text-sm md:text-base tracking-wide p-1 md:p-2">Email</th>
            <th className="text-sm md:text-base tracking-wide p-1 md:p-2">Message</th>
            <th className="text-sm md:text-base tracking-wide p-1 md:p-2">Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData?.map((contact, index)=> (
            <tr className="bg-white" key={index}>
              <td data-cell="Date" className="text-[13px] leading-7 md:text-sm font-medium p-1 md:p-2">{(new Date(contact.date)).toLocaleDateString()}</td>
              <td data-cell="Name" className="text-[13px] leading-7 md:text-sm font-medium p-1 md:p-2">{contact.name}</td>
              <td data-cell="Email" className="text-[13px] leading-7 md:text-sm font-medium p-1 md:p-2">{contact.email}</td>
              <td data-cell="Message" className="text-[13px] leading-7 md:text-sm font-medium p-1 md:p-2">{contact.message}</td>
              <td data-cell="Phone Number" className="text-[13px] leading-7 md:text-sm font-medium p-1 md:p-2">{contact.number}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {!data && <h3 className="font-bold text-center md:text-3xl">No Data Available.</h3>}
      </div>
      <div className='relative text-sm text-center my-2 md:my-4 font-bold tracking-wider group'>
          {pageNumber.length > 0 && <p>{currentPage} 0f {pageNumber.length} {pageNumber.length > 1 ? "pages" : "page" }</p>}
          <div className="my-2 md:my-5">
              <Splide options={{
                  drag: "free",
                  pagination: false,
                  perPage: 8,
                  perMove: 3,
                  gap: "20px",
                  focus    : 'center',
                  trimSpace: false,
                  breakpoints: {
                    768: {
                      perPage: 4,
                      perMove: 2,
                      gap: "10px",
                      focus: "none",
                      trimSpace: true,
                    },
                  }
              }} className="">
                  {pageNumber.map((num) => (
                    <SplideSlide key={num}><button onClick={() => setCurrentPage(num)} key={num} className={`${currentPage === num && "bg-BLUE text-white px-3 py-2 rounded-md"} px-3 py-2 text-sm md:text-base font-bold`}>{num}</button></SplideSlide>
                  ))}
              </Splide>
          </div>
      </div>
    </div>
  )
}

export default Contacts