import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';
import { API_ROOT } from "../lib/apiOrigin";
const FetchAllStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: ()=> axios.get(`${API_ROOT}/show`, { withCredentials: true })
  })
  
}
export default FetchAllStudents
