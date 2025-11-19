import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';

const api_splunk = import.meta.env.VITE_SPLUNK_GET_TOTAL
const FetchTotalSplunkUser = () => {
  return useQuery({
    queryKey: ["splunk"],
    queryFn: ()=> axios.get(api_splunk)
  })
  
}

export default FetchTotalSplunkUser