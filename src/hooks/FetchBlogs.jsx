import axios from 'axios'
import {
    useQuery, useInfiniteQuery
} from '@tanstack/react-query';


const FetchAllStudents = () => {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async ()=> {
      // let response = await axios.get("https://rss.app/feeds/v1.1/S8Gs6fUIOXz1noGL.json")
      // let response = await axios.get("https://rss.app/feeds/v1.1/xzPhtY6TiyREB3U2.json")
      // let response = await axios.get("https://rss.app/feeds/v1.1/tvWLcyjhrXA8Wsqv.json")
      let response = await axios.get("https://rss.app/feeds/v1.1/tC13ScBP00fhRzG2.json")
      return response
    }
  })
  
}

export default FetchAllStudents