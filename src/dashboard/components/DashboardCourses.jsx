import COURSES from "../../coursesAPI/api";


const DashboardCourses = () => {
  return (
    <section className="px-2 md:px-10 py-5">
        <div className="courses grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center gap-y-4 gap-x-2">
            {COURSES.map((course, index)=> (
            <a key={index} to={course.courseName.toLowerCase()} className="">
                <div
                    className={`rounded-xl`}
                    data-aos-once="true"
                    data-aos-duration="5000"
                    data-aos="fade-up"
                >
                    <div className=" rounded-tr-2xl rounded-tl-2xl">
                        <img
                            src={course.image}
                            className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
                            alt=""
                        />
                    </div>
                    <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
                        <p className="font-bold text-white text-md md:my-4 md:text-3xl">{course.courseName}</p>
                        <p className="my-2 font-bold">{course.intro}</p>
                        <p className="line-clamp-2 text-textColor md:max-w-[70%]">
                            {course.description}
                        </p>
                        <p className="font-bold my-5 md:text-xl">${course.price}</p>
                    </div>
                </div>
            </a>
            ))}
        </div>
    </section>
  )
}

export default DashboardCourses