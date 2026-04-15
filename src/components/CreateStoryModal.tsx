import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Smile, Camera, Video, Type } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isGenerating: boolean;
}

export function CreateStoryModal({ isOpen, onClose, onSubmit, isGenerating }: CreateStoryModalProps) {
  const [formData, setFormData] = useState({
    content: "",
    mediaType: "text" as "text" | "image" | "video",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ content: "", mediaType: "text" });
    onClose();
  };

  const onEmojiClick = (emojiData: any) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + emojiData.emoji
    }));
    setShowEmojiPicker(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Share a Story
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex justify-center gap-4">
            {[
              { id: "text", icon: Type, label: "Text" },
              { id: "image", icon: Camera, label: "Image" },
              { id: "video", icon: Video, label: "Video" },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, mediaType: type.id as any })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                  formData.mediaType === type.id 
                    ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                    : "bg-white/5 border-white/10 text-blue-100/40 hover:bg-white/10"
                )}
              >
                <type.icon className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">
                {formData.mediaType === 'text' ? 'What\'s on your mind?' : 'Add a caption'}
              </Label>
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0 text-blue-400 hover:text-blue-300")}>
                  <Smile className="w-5 h-5" />
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none bg-transparent" side="top" align="end">
                  <EmojiPicker theme={Theme.DARK} onEmojiClick={onEmojiClick} />
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              id="content"
              placeholder={formData.mediaType === 'text' ? "Type your story here..." : "Describe your story..."}
              className="bg-white/5 border-white/10 focus:border-blue-500 min-h-[120px] text-white placeholder:text-blue-100/30 rounded-xl"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
            <p className="text-xs text-blue-100/70">
              {formData.mediaType === 'text' 
                ? "Your story will be shared with your followers for 24 hours." 
                : `AI will generate a beautiful ${formData.mediaType} based on your description!`}
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isGenerating || !formData.content.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl shadow-lg shadow-blue-500/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Story...
              </>
            ) : (
              "Share Story"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
