import axios from 'axios'
import {
    useQuery,
} from '@tanstack/react-query';

const FetchLink = (api, email) => {
    return useQuery({
        queryKey: ["links"],
        queryFn: ()=> axios.get()
    })
}

export default FetchLink;