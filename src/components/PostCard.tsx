import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MapPin, DollarSign, Share2, Clock, User, Heart, MessageCircle, Sparkles, Trash2, Video, Loader2, Edit2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CommentSection } from "./CommentSection";
import { motion, AnimatePresence } from "motion/react";

interface PostCardProps {
  post: any;
  user: any;
  profile: any;
  isLiked: boolean;
  isFollowing: boolean;
  isStreakPartner: boolean;
  onLike: () => void;
  onFollow: () => void;
  onStreak: () => void;
  onShare: (post: any) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: any) => void;
  onGenerateVideo?: (postId: string, mealCombo: string) => Promise<void>;
  isAdmin?: boolean;
}

export function PostCard({ 
  post, 
  user, 
  profile, 
  isLiked, 
  isFollowing, 
  isStreakPartner, 
  onLike, 
  onFollow, 
  onStreak, 
  onShare,
  onDelete,
  onEdit,
  onGenerateVideo,
  isAdmin
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const timeAgo = post.createdAt?.toDate 
    ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
    : "just now";

  const handleDoubleTap = () => {
    if (!isLiked) {
      onLike();
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
    }
  };

  const renderTextWithMentions = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-blue-400 font-bold cursor-pointer hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <GlassCard className="overflow-hidden border-white/5" whileHover={{ y: -2 }}>
      {/* Post Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-blue-600 to-blue-400">
            <div className="p-[1px] bg-slate-950 rounded-full">
              <Avatar className="h-8 w-8 border-none">
                {post.authorPhoto ? (
                  <AvatarImage src={post.authorPhoto} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-blue-600 text-[10px] text-white font-bold">
                  {post.authorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">{post.authorName}</p>
            <p className="text-[10px] text-blue-200/50 mt-0.5">{post.location}</p>
          </div>
          {user && user.uid !== post.authorId && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-6 px-2 text-[10px] font-bold rounded-full ml-2",
                isFollowing ? "text-blue-100/30 hover:text-white" : "text-blue-400 hover:text-blue-300 bg-blue-500/10"
              )}
              onClick={onFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
          {user && user.uid !== post.authorId && isFollowing && !isStreakPartner && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] font-bold rounded-full ml-1 text-orange-400 hover:text-orange-300 bg-orange-500/10"
              onClick={onStreak}
            >
              <Sparkles className="w-3 h-3 mr-1" /> Streak
            </Button>
          )}
          {isStreakPartner && (
            <div className="flex items-center gap-1 ml-2 bg-orange-500/20 px-2 py-0.5 rounded-full">
              <span className="text-[10px] font-black text-orange-400">🔥</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onGenerateVideo && !post.videoURL && (user?.uid === post.authorId || isAdmin) && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              onClick={() => {
                setIsGeneratingVideo(true);
                onGenerateVideo(post.id, post.mealCombo).finally(() => setIsGeneratingVideo(false));
              }}
              disabled={isGeneratingVideo}
            >
              {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
            </Button>
          )}
          {onEdit && (user?.uid === post.authorId || isAdmin) && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              onClick={() => onEdit(post)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (user?.uid === post.authorId || isAdmin) && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-200/50" onClick={() => onShare(post)}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Post Image/Video */}
      {(post.imageURL || post.videoURL) && (
        <div 
          className="relative aspect-square overflow-hidden bg-slate-900 cursor-pointer"
          onDoubleClick={handleDoubleTap}
        >
          {post.videoURL ? (
            <video 
              src={post.videoURL} 
              controls 
              className="w-full h-full object-cover"
              poster={post.imageURL}
              loop
              muted
              autoPlay
            />
          ) : (
            <img
              src={post.imageURL}
              alt={post.mealCombo}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          
          <AnimatePresence>
            {showHeartOverlay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            <Badge className="bg-black/50 backdrop-blur-md border-white/10 text-white font-bold">
              Ksh {post.price}
            </Badge>
            {post.mealType && (
              <Badge className="bg-blue-600/80 backdrop-blur-md border-none text-white text-[10px] capitalize">
                {post.mealType}
              </Badge>
            )}
          </div>

          {post.dietaryRestrictions && post.dietaryRestrictions.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1">
              {post.dietaryRestrictions.map((r: string) => (
                <Badge key={r} variant="outline" className="bg-black/30 backdrop-blur-sm border-white/20 text-white text-[8px]">
                  {r}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onLike}
              className={cn(
                "transition-transform active:scale-125",
                isLiked ? "text-red-500" : "text-white hover:text-blue-400"
              )}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button 
              onClick={() => onShare(post)}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <div className="text-[10px] text-blue-200/40 font-medium uppercase tracking-wider">
            {timeAgo}
          </div>
        </div>

        {/* Likes Count */}
        <div className="text-xs font-bold text-white">
          {post.likesCount || 0} likes
        </div>

        {/* Caption */}
        <div className="text-sm space-y-1">
          <div className="text-white leading-relaxed">
            <span className="font-bold mr-2">{post.authorName}</span>
            <span className="font-medium text-blue-400">#{post.mealCombo.replace(/[^a-zA-Z0-9]/g, '')}</span>
            <div className="mt-1 text-blue-100/80">
              {renderTextWithMentions(post.description)}
            </div>
          </div>
        </div>

        {/* Comments Link */}
        <button 
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-blue-200/50 hover:text-blue-200 transition-colors"
        >
          {showComments ? "Hide all comments" : `View all comments`}
        </button>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <CommentSection 
                postId={post.id} 
                user={user} 
                profile={profile} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

