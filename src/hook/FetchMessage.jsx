import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';
const api = import.meta.env.VITE_BACKEND_API
const FetchMessage = () => {
    return useQuery({
        queryKey: ["messages"],
        queryFn: ()=> axios.get(`${api}/api/messages`)
    })
}

export default FetchMessage;