import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, MapPin, DollarSign, Info, Loader2, Sparkles, Smile, Check } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isGeneratingImage: boolean;
  editPost?: any;
}

export function CreatePostModal({ isOpen, onClose, onSubmit, isGeneratingImage, editPost }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    mealCombo: "",
    location: "",
    price: "",
    description: "",
    mealType: "lunch",
    dietaryRestrictions: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (editPost) {
      setFormData({
        mealCombo: editPost.mealCombo || "",
        location: editPost.location || "",
        price: editPost.price?.toString() || "",
        description: editPost.description || "",
        mealType: editPost.mealType || "lunch",
        dietaryRestrictions: editPost.dietaryRestrictions || [],
      });
    } else {
      setFormData({
        mealCombo: "",
        location: "",
        price: "",
        description: "",
        mealType: "lunch",
        dietaryRestrictions: [],
      });
    }
  }, [editPost, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
      });
      if (!editPost) {
        setFormData({ mealCombo: "", location: "", price: "", description: "", mealType: "lunch", dietaryRestrictions: [] });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDietary = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const onEmojiClick = (emojiData: any) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description + emojiData.emoji
    }));
    setShowEmojiPicker(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-950 border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {editPost ? "Update Your Meal" : "Share Your Meal"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="mealCombo">Meal Combo</Label>
            <div className="relative">
              <Utensils className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <Input
                id="mealCombo"
                placeholder="e.g. Ugali, Sukuma & Beef"
                className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-blue-100/30"
                value={formData.mealCombo}
                onChange={(e) => setFormData({ ...formData, mealCombo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <Input
                  id="location"
                  placeholder="e.g. Mess, Kibandaski"
                  className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-blue-100/30"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (Ksh)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <Input
                  id="price"
                  type="number"
                  placeholder="150"
                  className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-blue-100/30"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meal Type</Label>
            <div className="flex gap-2">
              {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={formData.mealType === type ? "default" : "outline"}
                  className={`flex-1 text-xs capitalize ${formData.mealType === type ? 'bg-blue-600' : 'bg-white/5 border-white/10'}`}
                  onClick={() => setFormData({ ...formData, mealType: type })}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {["Vegetarian", "Vegan", "Halal", "Gluten-Free"].map((restriction) => (
                <Button
                  key={restriction}
                  type="button"
                  variant="outline"
                  className={`text-xs h-8 px-3 rounded-full border-white/10 ${formData.dietaryRestrictions.includes(restriction) ? 'bg-blue-600 border-blue-600' : 'bg-white/5'}`}
                  onClick={() => toggleDietary(restriction)}
                >
                  {formData.dietaryRestrictions.includes(restriction) && <Check className="w-3 h-3 mr-1" />}
                  {restriction}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description (Optional)</Label>
              <Popover>
                <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0 text-blue-400 hover:text-blue-300")}>
                  <Smile className="w-5 h-5" />
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none bg-transparent" side="top" align="end">
                  <EmojiPicker theme={Theme.DARK} onEmojiClick={onEmojiClick} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="relative">
              <Info className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <Textarea
                id="description"
                placeholder="Tell us more about the taste... use @ to mention friends"
                className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 min-h-[100px] text-white placeholder:text-blue-100/30"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {!editPost && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
              <p className="text-xs text-blue-100/70">
                Ulikula? AI will automatically generate a delicious image for your meal combo!
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || isGeneratingImage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl shadow-lg shadow-blue-500/20 mt-4"
          >
            {loading || isGeneratingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isGeneratingImage ? "Generating AI Image..." : "Posting..."}
              </>
            ) : (
              editPost ? "Update Post" : "Post Combo"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
