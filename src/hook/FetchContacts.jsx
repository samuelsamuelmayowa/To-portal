import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';


const FetchContacts = () => {
  return useQuery({
    queryKey: ["contact"],
    queryFn: ()=> axios.get("https://to-backendapi-v1.onrender.com/api/contact")
  })
}

export default FetchContacts