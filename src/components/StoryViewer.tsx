import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Clock, Eye, Trash2, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Story {
  id: string;
  userId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  mediaURL?: string;
  mediaType: "text" | "image" | "video";
  createdAt: any;
  viewCount?: number;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (storyId: string) => void;
  onView?: (storyId: string) => void;
  currentUser?: any;
}

export function StoryViewer({ stories, initialIndex, isOpen, onClose, onDelete, onView, currentUser }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [viewers, setViewers] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      if (isPaused) return;
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (100 * 50ms)

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, isPaused]);

  // Record view when story changes
  useEffect(() => {
    if (isOpen && stories[currentIndex] && onView) {
      onView(stories[currentIndex].id);
    }
  }, [currentIndex, isOpen]);

  // Listen for viewers if current user is the author
  useEffect(() => {
    if (!isOpen || !stories[currentIndex] || !currentUser) return;
    
    const story = stories[currentIndex];
    if (story.userId !== currentUser.uid) {
      setViewers([]);
      return;
    }

    const q = query(
      collection(db, "stories", story.id, "views"),
      orderBy("viewedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const viewersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setViewers(viewersData);
    });

    return unsubscribe;
  }, [isOpen, currentIndex, currentUser]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  if (!stories.length || currentIndex >= stories.length) return null;

  const currentStory = stories[currentIndex];
  const isOwner = currentUser?.uid === currentStory.userId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full h-[80vh] p-0 bg-slate-950 border-none overflow-hidden flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-50"
                style={{ 
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-blue-500">
              {currentStory.authorPhoto ? (
                <AvatarImage src={currentStory.authorPhoto} />
              ) : null}
              <AvatarFallback className="bg-blue-600 text-white">
                {currentStory.authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-white">{currentStory.authorName}</p>
              <div className="flex items-center gap-1 text-[10px] text-white/60">
                <Clock className="w-3 h-3" />
                <span>
                  {currentStory.createdAt?.toDate ? formatDistanceToNow(currentStory.createdAt.toDate(), { addSuffix: true }) : "just now"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={() => onDelete(currentStory.id)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 flex items-center justify-center relative bg-slate-900"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full flex items-center justify-center p-8"
            >
              {currentStory.mediaType === 'text' ? (
                <div className="text-center">
                  <p className="text-2xl font-bold text-white leading-relaxed">
                    {currentStory.content}
                  </p>
                </div>
              ) : currentStory.mediaType === 'image' ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                  <img 
                    src={currentStory.mediaURL} 
                    alt="Story" 
                    className="max-w-full max-h-[60%] rounded-2xl shadow-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-lg font-medium text-white text-center">
                    {currentStory.content}
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                  <video 
                    src={currentStory.mediaURL} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="max-w-full max-h-[60%] rounded-2xl shadow-2xl object-cover"
                  />
                  <p className="text-lg font-medium text-white text-center">
                    {currentStory.content}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <button 
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Viewers Info (Only for Owner) */}
          {isOwner && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <Popover onOpenChange={(open) => setIsPaused(open)}>
                <PopoverTrigger className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white hover:bg-black/60 transition-colors">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">{currentStory.viewCount || 0} Views</span>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-slate-900 border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
                  <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Viewers</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {viewers.length > 0 ? viewers.map((viewer) => (
                      <div key={viewer.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <Avatar className="h-8 w-8">
                          {viewer.userPhoto ? <AvatarImage src={viewer.userPhoto} /> : null}
                          <AvatarFallback className="bg-blue-600 text-[10px] text-white">
                            {viewer.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{viewer.userName}</p>
                          <p className="text-[10px] text-white/40">
                            {viewer.viewedAt?.toDate ? formatDistanceToNow(viewer.viewedAt.toDate(), { addSuffix: true }) : "just now"}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-4 text-center">
                        <p className="text-xs text-white/40 italic">No views yet</p>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
