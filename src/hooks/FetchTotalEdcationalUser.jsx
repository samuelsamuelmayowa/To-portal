import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';

const api_educational = import.meta.env.VITE_EDUCATIONAL_GET_TOTAL 
const FetchTotalEdcationalUser = () => {
  return useQuery({
    queryKey: ["educationals"],
    queryFn: ()=> axios.get(api_educational)
  })
  
}

export default FetchTotalEdcationalUser