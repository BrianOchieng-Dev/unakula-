import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  name: string;
  photoURL?: string;
  isTrending?: boolean;
  isRealStory?: boolean;
}

interface StoriesProps {
  stories: Story[];
  onAddStory: () => void;
  onViewStory: (index: number) => void;
  userProfile?: any;
}

export function Stories({ stories, onAddStory, onViewStory, userProfile }: StoriesProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {/* Add Story Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
        onClick={onAddStory}
      >
        <div className="relative p-[2px] rounded-full bg-slate-800 group-hover:bg-blue-500 transition-colors">
          <div className="p-[2px] bg-slate-950 rounded-full">
            <Avatar className="h-16 w-16 border-2 border-transparent">
              {userProfile?.photoURL ? (
                <AvatarImage src={userProfile.photoURL} className="object-cover opacity-50" />
              ) : null}
              <AvatarFallback className="bg-slate-900 text-blue-400 font-bold">
                +
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-slate-950">
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </motion.div>
          </div>
        </div>
        <span className="text-[10px] text-blue-100/70 font-bold">Your Story</span>
      </motion.div>

      {stories.map((story, i) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
          onClick={() => onViewStory(i)}
        >
          <div className={cn(
            "relative p-[2px] rounded-full transition-transform group-hover:scale-105",
            story.isRealStory 
              ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500" 
              : "bg-gradient-to-tr from-blue-600 to-blue-400"
          )}>
            <div className="p-[2px] bg-slate-950 rounded-full">
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
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full border border-slate-950">
                HOT
              </div>
            )}
          </div>
          <span className="text-[10px] text-blue-100/70 font-medium max-w-[64px] truncate">
            {story.name.split(' ')[0]}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
