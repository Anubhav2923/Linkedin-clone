import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2 } from "lucide-react";
import PostAction from "./PostAction";
import {formatDistanceToNow} from 'date-fns'


const Post = ({ post }) => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient();

  const [showComments, setShowComments] = useState(false);
  const [newComments, setNewComments] = useState("");
  const [comment, setComments] = useState(post.comments || []);
  const isOwner = authUser._id === post.author._id;
  const isLiked = post.likes.includes(authUser._id);


  // Delete Post Mutation Function
  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/posts/delete/${post._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted Successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });


  //Post Comment Creation Mutation function
  const { mutate: createComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (newComments) => {
      await axiosInstance.post(`/posts/${post._id}/comment`, {
        content: newComments,
      });
    },
    onSuccess: () => {
      toast.success("Comment added successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to comment");
    },
  });

  //Post like Mutation function

  const { mutate: likePost, isPending: isLikingPost } = useMutation({
    mutationFn: async () => {
        await axiosInstance.post(`/posts/${post._id}/like`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        // queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
});

//Delete Post Logic Code
  const handeDeletePost = () => {
    if (!window.confirm("Are you sure you want to delete this post")) return;
    deletePost();
  };

  //Like Post Logic Code
  const handleLikePost = async() => {
    if(isLikingPost) return
    likePost();
  };

  //Add Comment Logic Code
  const handleAddComment = async(e)=> {
    e.preventDefault();
    if(newComments.trim()) {
        createComment(newComments);
        setNewComments("");
        setComments([
            ...comment,
            {
                content: newComments,
                user:{
                    _id: authUser._id,
                    name: authUser.name,
                    porfilePicture: authUser.porfilePicture,
                },
                createdAt: new Date(),
            }
        ]);
    }
  }

  return (
    <div className="bg-secondary rounded-lg shadow mb-4 ">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to={`/profile/${post?.author?.username}`}>
              <img
                src={post.author.porfilePicture || "/avatar.png"}
                alt={post.author.name}
                className="size-10 rounded-full mr-3"
              />
            </Link>
            <div className="">
              <Link to={`/profile/${post?.author?.username}`}>
                <h3 className="font-semibold">{post.author.name}</h3>
              </Link>
              <p className="text-xs text-info">{post.author.headline}</p>
              <p className="text-xs text-info">
                {formatDistanceToNow(new Date(post.createdAt), {addSuffix: true})}
              </p>

              {/* show created post  */}
            </div>
          </div>
          {isOwner && (
            <button
              onClick={handeDeletePost}
              className="text-red-500 hover:text-red-700"
            >
              {isDeletingPost ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>
        <p className="mb-4">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="rounded-lg w-full mb-4"
          />
        )}

        <div className="flex justify-between text-info">
          <PostAction
            icon={
              <ThumbsUp
                size={18}
                className={isLiked ? "text-ble-500 fill-blue-300" : ""}
              />
            }
            text={`Like (${post.likes.length})`}
            onClick={handleLikePost}
          />

          <PostAction 
          icon = {<MessageCircle size={18}/>}
          text = {`Comment (${comment.length})`}
          onClick = {()=> setShowComments(!showComments)}
          />
          <PostAction icon= {<Share2 size={18} />} text= 'Share'/>
        </div>
      </div>

      {showComments && (
        <div className="px-4 pb-4"> 
            <div className="mb-4 max--60 overflow-y-auto">
                {comment.map((comment)=> (
                    <div key={comment._id} className="mb-2 bg-base-100 p-2 rounded flex items-start">
                        <img
                        src={comment.user.porfilePicture || '/avatar.png'}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                        />
                        <div className="flex-grow">
                            <div className="flex items-center mb-1">
                                <span className="font-semibold mr-2">{comment.user.name}</span>
                                <span className="font-semibold text-info">
                                {formatDistanceToNow(new Date(comment.createdAt))}
                                </span>
                            </div>
                            <p>{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddComment} className="flex items-center">
                <input type="text"  placeholder="add a comment..."
                    value={newComments}
                    onChange={(e)=> setNewComments(e.target.value)}
                    className="flex-grow p-2 rounded-1-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button type="submit" className="bg-primary text-white p-2 rounded-r-full hover:bg-primary-dark transition duration-300"
                disabled={isAddingComment}
                >
                    {isAddingComment ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
      
      )}
    </div>
  
  );
};

export default Post;
