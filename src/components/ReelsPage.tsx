import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Share2, Music2, User, Loader2, Film, ChevronDown, ChevronUp, Plus, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ReelsPageProps {
  user: any;
  profile: any;
  userLikes: Set<string>;
  following: Set<string>;
  streaks: any[];
  onLike: (postId: string) => void;
  onFollow: (authorId: string) => void;
  onStreak: (authorId: string) => void;
  onShare: (post: any) => void;
}

function ReelItem({ 
  post, 
  user, 
  isLiked, 
  onLike, 
  onShare 
}: { 
  post: any, 
  user: any, 
  isLiked: boolean, 
  onLike: () => void, 
  onShare: () => void 
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      onLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="relative h-[calc(100vh-192px)] w-full snap-start bg-black overflow-hidden rounded-2xl mb-4">
      <video
        ref={videoRef}
        src={post.videoURL}
        className="h-full w-full object-cover"
        loop
        playsInline
        onClick={togglePlay}
        onDoubleClick={handleDoubleTap}
      />

      {/* Heart Overlay on Double Tap */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-40">
        <div className="flex flex-col items-center gap-1">
          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-600 to-blue-400">
            <Avatar className="h-12 w-12 border-2 border-black">
              {post.authorPhoto ? <AvatarImage src={post.authorPhoto} /> : null}
              <AvatarFallback className="bg-blue-600 text-white font-bold">
                {post.authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full p-0.5 border-2 border-black">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        <button onClick={onLike} className="flex flex-col items-center gap-1">
          <div className={cn(
            "p-3 rounded-full bg-black/20 backdrop-blur-md transition-colors",
            isLiked ? "text-red-500" : "text-white"
          )}>
            <Heart className={cn("w-7 h-7", isLiked && "fill-current")} />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{post.likesCount || 0}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">Chat</span>
        </button>

        <button onClick={onShare} className="flex flex-col items-center gap-1">
          <div className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white">
            <Share2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">Share</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg">{post.authorName}</h3>
            <span className="text-blue-400 text-xs font-bold px-2 py-0.5 bg-blue-500/10 rounded-full">
              MMUST Comrade
            </span>
          </div>
          
          <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-white/60 text-xs">
            <div className="flex items-center gap-1">
              <Music2 className="w-3 h-3" />
              <span className="animate-marquee whitespace-nowrap overflow-hidden">
                Original Audio - {post.mealCombo}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Film className="w-3 h-3" />
              <span>AI Generated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-6 rounded-full bg-black/20 backdrop-blur-sm">
            <Video className="w-12 h-12 text-white/50" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ReelsPage({ 
  user, 
  profile, 
  userLikes, 
  following, 
  streaks, 
  onLike, 
  onFollow, 
  onStreak, 
  onShare 
}: ReelsPageProps) {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("videoURL", "!=", null),
      orderBy("videoURL"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReels(reelsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-200/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading Cinematic Reels...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-192px)] overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-20">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <Film className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-bold text-white uppercase tracking-widest">MMUST Reels</span>
      </div>

      <AnimatePresence mode="popLayout">
        {reels.map((post) => (
          <ReelItem
            key={post.id}
            post={post}
            user={user}
            isLiked={userLikes.has(post.id)}
            onLike={() => onLike(post.id)}
            onShare={() => onShare(post)}
          />
        ))}
      </AnimatePresence>

      {reels.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Video className="w-10 h-10 text-blue-200/20" />
          </div>
          <h3 className="text-xl font-bold text-white">No Cinematic Reels</h3>
          <p className="text-sm text-blue-200/50 mt-2 max-w-[240px]">
            Be the first comrade to generate an AI video for your meal combo!
          </p>
        </div>
      )}
    </div>
  );
}
