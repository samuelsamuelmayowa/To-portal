import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Splunk from "../assets/images/Splunk-blog-img.jpg"
import Twitter from "../assets/images/Twitter-Logо.svg"
import NoBlog from "../components/NoBlog"
import FetchBlogs from "../hooks/FetchBlogs"
import { useInView } from "framer-motion";
import Loader from "../components/Loader";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css'
import "../../src/assets/css/blogpagination.css"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


const BlogPage = () => {
  const lastBlogRef = useRef(null)
  // const [blogNumber, setBlogNumber] = useState(4)
  const { data, isLoading, error } = FetchBlogs()
  const {data: blog, isLoading: loadingBlog, error: blogError} = useQuery({
    queryKey: ["someOtherBlogs"],
    queryFn: ()=> axios.get("https://to-backendapi-v1.vercel.app/api/news")
  })
  // console.log(blog?.data?.response?.sources)
  const isInView = useInView(lastBlogRef, { once: true })

  // useEffect(() => {
  //   if (isInView) {
  //     setBlogNumber((prevNumber) => prevNumber + 5);
  //   }
  // }, [isInView]);

  let date = new Date()
  let hour = date.getHours()
  let timeOfDay;

  if (hour < 12) {
    timeOfDay = 'Good Morning'
  }
  else if (hour >= 12 && hour < 17) {
    timeOfDay = 'Good Afternoon'
  }
  else {
    timeOfDay = 'Good Evening'
  }

  if (isLoading || loadingBlog) return <Loader />
  if (error || blogError) return <p className='text-center text-red-500 md:text-3xl font-black'>{error.message}</p>


  return (
    <>
      {!data?.data?.items.length && <NoBlog />}
      <section className="relative flex flex-col gap-3 md:gap-5 px-5 md:px-32 py-20 md:py-28">
      <h1 className="font-bold text-black dark:text-gray-200  sm:text-xl lg:text-3xl">{timeOfDay}!!</h1>
        <div className="flex items-center gap-2 md:gap-6">
          <Link to="https://splunk.com/en_us/blog" target="_blank">
            <div className="flex gap-2 items-center group">
              <img src={Splunk} alt="" className="w-10 lg:w-32 rounded-2xl" />
              <div>
                <h1 className="text-xs md:text-sm group-hover:text-BLUE duration-200 font-black text-gray-900 dark:text-gray-200 sm:text-xl lg:text-2xl">For splunk News</h1>
                <p className="font-semibold text-xs md:text-sm"><span className="group-hover:animate-pulse">👈</span>Click Here</p>
              </div>
            </div>
          </Link>
          <Link to="https://twitter.com/splunk?ref_src=twsrc%5Etfw%7Ctwcamp%5Eembeddedtimeline%7Ctwterm%5Escreen-name%3Asplunk%7Ctwcon%5Es1_c1" target="_blank">
            <div className="flex gap-2 items-center group">
              <img src={Twitter} alt="" className="w-10 md:w-40 rounded-2xl" />
              <div>
                <h1 className="text-xs md:text-sm group-hover:text-BLUE duration-200 font-black text-gray-900 dark:text-gray-200 sm:text-xl lg:text-2xl">Splunk on Twitter</h1>
                <p className="font-semibold text-xs md:text-sm"><span className="group-hover:animate-pulse">👈</span>Click Here</p>
              </div>
            </div>
          </Link>
        </div>
        <h1 className="relative pl-3 stories text-sm md:text-lg font-bold">Blog Pages</h1>
        <Splide className="flex flex-col text-center" options={{
          pagination: false,
          arrows: false,
          height: "28px",
          gap: "20px",
          direction : 'ttb',
          paginationDirection: 'ttb',
          autoplay: true,
          interval: 2000,
          speed: 2000,
        }}>
          {blog?.data?.response?.sources.map((blog)=> (
            <SplideSlide key={blog.id}>
              <Link to={blog.url} target="_blank"className="font-bold text-sm md:text-xl hover:text-BLUE">🔥{blog.name}</Link>
            </SplideSlide>
          ))}
        </Splide>
        <h1 className="relative pl-3 stories text-sm md:text-lg font-bold">STORIES FOR YOU</h1>
        {/* {data?.data?.items.map((blog, index) => index <= blogNumber && (
          <Link to={blog.url} key={blog.id} target="_blank">
            <div ref={data?.data?.items?.length - 1 && lastBlogRef} className="group flex items-center gap-2 md:gap-3">
              <div className="flex-1">
                <LazyLoadImage effect="blur" src={blog.image} alt={`Blog Image for ${blog.title}`} className="w-[90px] md:w-[200px] object-cover aspect-square rounded-md" />
              </div>
              <div className="flex-[4]">
                <p className="text-xs md:text-base">{(new Date(blog.date_published)).toLocaleDateString()}</p>
                <h1 className="text-xs md:text-2xl font-bold group-hover:text-BLUE duration-200">{blog.title}</h1>
                <p className="text-xs md:text-lg line-clamp-2 md:line-clamp-3">{blog.content_text}</p>
              </div>
            </div>
          </Link>
        ))} */}
        <Splide className="relative" options={{
          type: "loop",
          perPage: 3,
          perMove: 2,
          autoplay: true,
          interval: 4000,
          speed: 2000,
          gap: "20px",
          paginationDirection: 'ttb',
          arrows: false,
          width: "100%",
          breakpoints: {
            768: {
              interval: 3000,
              speed: 1000,
              autoplay: true,
              pagination: false,
              perPage: 1,
              perMove: 1,
            },
          }
        }}>
          {data?.data?.items.map((blog) => (
            <SplideSlide key={blog.id} className="relative blog-post group">
              <Link to={blog.url} target="_blank">
                <LazyLoadImage effect="blur" src={blog.image} alt={`Blog Image for ${blog.title}`} className="relative z-[20] w-full aspect-square object-cover rounded-md" />
                <div className="absolute text-black z-10 bottom-2 p-3">
                  <p className="text-xs">{(new Date(blog.date_published)).toTimeString()}</p>
                  <h1 className="text-md font-bold group-hover:text-BLUE duration-200">{blog.title}</h1>
                  <p className="font-semibold text-xs line-clamp-2 md:line-clamp-3">{blog.content_text}</p>
                </div>
                <div className=""></div>
              </Link>
            </SplideSlide>
          ))}
        </Splide>
        
      </section>
    </>
  )
}

export default BlogPage