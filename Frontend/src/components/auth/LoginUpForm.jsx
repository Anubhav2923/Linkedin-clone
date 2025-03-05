import { useMutation,useQueryClient } from "@tanstack/react-query";
import { useState } from "react"
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const LoginUpForm = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const querClient = useQueryClient();

    const {mutate: loginMutate, isLoading} = useMutation({
        mutationFn: (userData) => axiosInstance.post('/auth/login',userData),

        onSuccess: ()=> {
            querClient.invalidateQueries({queryKey: ['authUser']});
        },
        onError:(err)=> {
            toast.error(err.response.data.message || 'Someting went wrong')
        },
    });

    const handleSubmit = (e)=> {
        e.preventDefault();
        loginMutate({username,password});
    };

  return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <input 
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e)=> setUsername(e.target.value)}
                className="input input-bordered w-full"
                required
            />
            <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                className="input input-bordered w-full"
                required 
            />

            <button type="submit" className="btn btn-primary w-full">
                {isLoading ? <Loader className="size-5 animate-spin"/> : "Login"}
            </button>
        </form>
  )
}

export default LoginUpForm