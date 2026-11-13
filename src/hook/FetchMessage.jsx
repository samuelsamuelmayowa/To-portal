import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';
import { API_ROOT } from "../lib/apiOrigin";
const FetchMessage = () => {
    return useQuery({
        queryKey: ["messages"],
        queryFn: ()=> axios.get(`${API_ROOT}/messages`, { withCredentials: true })
    })
}

export default FetchMessage;
