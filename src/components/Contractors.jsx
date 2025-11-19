import { useState } from 'react';
import FetchContractors from "../hooks/FetchContractors"
import { Splide, SplideSlide } from '@splidejs/react-splide';
import ServerErrorPage from './ServerErrorPage';
import '@splidejs/react-splide/css';
import moment from "moment";
import Loader from "./Loader"

const Contractors = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(10)
  const { data, isLoading, error } = FetchContractors();

  if (error) return <p className='text-center text-red-500 md:text-3xl font-black'>{error.message}</p>
  if (isLoading) return <Loader />
  if (data?.status === 500) return <ServerErrorPage />

  const lastPostIndex = currentPage * postsPerPage
  const firstPostIndex = lastPostIndex - postsPerPage
  const paginatedData = data?.data?.response?.slice(firstPostIndex, lastPostIndex)
  const length = data?.data?.response?.length || 1

  const pageNumber = []
  for (let i = 1; i <= Math.ceil((length) / postsPerPage); i++) {
    pageNumber.push(i)
  }

  return (
    <div className="md:p-5 rounded-xl overflow-hidden">
      <table className='contractors md:p-3 table-auto border-collapse w-full'>
        <thead className=''>
          <tr className='font-black text-left'>
            <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>Registration Date</th>
            <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>Contractor Names</th>
            <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>Email Address</th>
            <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>pdfurl</th>
            <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>Link_portfolio</th>
          </tr>
        </thead>
        <tbody className='tbody'>
          {paginatedData?.map((contractor, index) => (
            <tr key={index} className=''>
              <td data-cell="Registration Date" className='text-[13px] leading-7 md:text-sm font-medium  md:p-2'>{moment(contractor.date)
                .utc()
                .format("YYYY-MM-DD")}</td>
              <td data-cell="Contractor Names" className='text-[13px] leading-7 md:text-sm font-medium  md:p-2'>{contractor.name}</td>
              <td data-cell="Email Address" className='text-[13px] leading-7 md:text-sm font-medium md:p-2'>{contractor.email}</td>

              <td data-cell="URL" className='text-[13px] leading-7 md:text-sm font-medium  md:p-2'><a className='text-blue-400 underline' href={`${contractor.pdfurl}`}>Open</a></td>
              <td data-cell="Portfolio Link" className='text-[13px] leading-7 md:text-sm font-medium  md:p-2'><a href={`${contractor.pdfurl}`}>{contractor.link_portfolio }</a></td>
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
            perPage: 5,
            perMove: 3,
            gap: "20px",
            focus: 'center',
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

export default Contractors