import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  userId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  mediaURL?: string;
  mediaType: "text" | "image" | "video";
  createdAt: any;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, isOpen, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (100 * 50ms)

    return () => clearInterval(timer);
  }, [isOpen, currentIndex]);

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
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center relative bg-slate-900">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
