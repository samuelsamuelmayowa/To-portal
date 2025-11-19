import noBlogImg from "../assets/images/noblog.jpg";

const NoBlog = () => {
  return (
    <section className="min-h-screen text-center px-2 py-10 md:p-10 bg-white">
        <div className="md:min-h-[500px]">
          <img src={noBlogImg} className="mx-auto md:w-[500px]" alt=""/>
        </div>
        <h1 className="w-full md:w-1/2 mx-auto font-medium text-3xl md:text-4xl">Sorry, there are no blogs available right now. Please check back later</h1>
    </section>
  )
}

export default NoBlog;