import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Plus, Eye } from "lucide-react";

interface Story {
  id: string;
  name: string;
  photoURL?: string;
  isTrending?: boolean;
  isRealStory?: boolean;
  storyData?: any;
}

interface StoriesProps {
  stories: Story[];
  onAddStory: () => void;
  onViewStory: (index: number) => void;
  userProfile?: any;
  currentUser?: any;
}

export function Stories({ stories, onAddStory, onViewStory, userProfile, currentUser }: StoriesProps) {
  // Find if current user has a story
  const myStoryIndex = stories.findIndex(s => s.isRealStory && s.storyData?.userId === currentUser?.uid);
  const myStory = myStoryIndex !== -1 ? stories[myStoryIndex] : null;
  
  // Other stories (excluding current user's real story)
  const otherStories = stories.filter((_, i) => i !== myStoryIndex);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {/* Add Story / My Story */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={myStory ? () => onViewStory(myStoryIndex) : onAddStory}
            className={cn(
              "w-16 h-16 rounded-full p-[2px] transition-all duration-300",
              myStory 
                ? "bg-gradient-to-tr from-blue-600 to-blue-400" 
                : "bg-muted hover:bg-blue-500"
            )}
          >
            <div className="w-full h-full rounded-full bg-background dark:bg-slate-950 p-[2px]">
              <Avatar className="w-full h-full border-none">
                {userProfile?.photoURL ? (
                  <AvatarImage src={userProfile.photoURL} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-muted text-blue-400 font-bold">
                  {userProfile?.fullname?.charAt(0) || "+"}
                </AvatarFallback>
              </Avatar>
            </div>
          </motion.button>
          {!myStory && (
            <button 
              onClick={onAddStory}
              className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 rounded-full border-2 border-background dark:border-slate-950 flex items-center justify-center text-white shadow-lg"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
          {myStory && myStory.storyData?.viewCount > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-blue-600 px-1.5 py-0.5 rounded-full border border-background dark:border-slate-950 flex items-center gap-0.5 shadow-lg">
              <Eye className="w-2 h-2 text-white" />
              <span className="text-[8px] font-bold text-white">{myStory.storyData.viewCount}</span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-bold">
          {myStory ? "My Story" : "Your Story"}
        </span>
      </div>

      {/* Other Stories */}
      {otherStories.map((story) => {
        const originalIndex = stories.findIndex(s => s.id === story.id);
        
        return (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
            onClick={() => onViewStory(originalIndex)}
          >
            <div className={cn(
              "relative p-[2px] rounded-full transition-transform group-hover:scale-105",
              story.isRealStory 
                ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500" 
                : "bg-gradient-to-tr from-blue-600 to-blue-400"
            )}>
              <div className="p-[2px] bg-background dark:bg-slate-950 rounded-full">
                <Avatar className="h-16 w-16 border-2 border-transparent">
                  {story.photoURL ? (
                    <AvatarImage src={story.photoURL} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-blue-600 text-white font-bold">
                    {story.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {story.isTrending && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full border border-background dark:border-slate-950">
                  HOT
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium max-w-[64px] truncate">
              {story.name.split(' ')[0]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
