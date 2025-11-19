import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';


const FetchAllStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: ()=> axios.get("https://to-backendapi-v1.onrender.com/api/show")
  })
  
}

export default FetchAllStudents