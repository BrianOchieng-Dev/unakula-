/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  serverTimestamp,
  increment,
  writeBatch,
  where,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType,
  deleteUser,
  deleteDoc
} from "@/lib/firebase";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { PostCard } from "./components/PostCard";
import { CreatePostModal } from "./components/CreatePostModal";
import { ChatBot } from "./components/ChatBot";
import { ProfilePage } from "./components/ProfilePage";
import { Stories } from "./components/Stories";
import { BottomNav } from "./components/BottomNav";
import { generateMealImage, chatWithAssistant, generateMealVideo } from "./services/gemini";
import { Toaster, toast } from "sonner";
import { compressImage } from "@/lib/utils";
import { Plus, Filter, Sparkles, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [view, setView] = useState<'feed' | 'profile'>('feed');
  const [posts, setPosts] = useState<any[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [streaks, setStreaks] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isAuthModalOpenRef = useRef(isAuthModalOpen);
  useEffect(() => { isAuthModalOpenRef.current = isAuthModalOpen; }, [isAuthModalOpen]);
  
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup" | "register-details">("login");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("recent");
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed:", firebaseUser?.uid);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            console.log("User profile found:", userDoc.data());
            setProfile(userDoc.data());
            setIsAuthModalOpen(false);
          } else {
            console.log("No user profile found for UID:", firebaseUser.uid);
            // Only open modal if it's not already open
            if (!isAuthModalOpenRef.current) {
              setAuthModalMode("register-details");
              setIsAuthModalOpen(true);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const handleAuthSuccess = (firebaseUser: any) => {
    console.log("Auth Success Callback:", firebaseUser?.uid);
    // If the user object passed has profile data, set it immediately
    if (firebaseUser?.fullname) {
      setProfile(firebaseUser);
    }
    setIsAuthModalOpen(false);
  };

  // Posts Listener
  useEffect(() => {
    if (!isAuthReady) return;
    
    const path = "posts";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, [isAuthReady]);

  // User Likes Listener
  useEffect(() => {
    if (!user) {
      setUserLikes(new Set());
      return;
    }

    const path = "likes";
    const q = query(collection(db, path), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const likedPostIds = new Set(snapshot.docs.map(doc => doc.data().postId));
      setUserLikes(likedPostIds);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, [user]);

  // Following Listener
  useEffect(() => {
    if (!user) {
      setFollowing(new Set());
      return;
    }

    const path = "follows";
    const q = query(collection(db, path), where("followerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followingIds = new Set(snapshot.docs.map(doc => doc.data().followingId));
      setFollowing(followingIds);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, [user]);

  // Streaks Listener
  useEffect(() => {
    if (!user) {
      setStreaks([]);
      return;
    }

    const path = "streaks";
    const q = query(collection(db, path), where("partnerIds", "array-contains", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const streaksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStreaks(streaksData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, [user]);

  const handleLogin = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error("Failed to sign out.");
    }
  };

  const handleRegister = async (data: any) => {
    if (!user) return;
    try {
      const profileData = {
        ...data,
        uid: user.uid,
        email: user.email || "", // Keep email in DB but remove from registration UI
        role: "student",
        photoURL: data.photoURL || user.photoURL || "",
      };
      await setDoc(doc(db, "users", user.uid), profileData);
      setProfile(profileData);
      setIsAuthModalOpen(false);
      toast.success("Registration complete! Welcome to Ulikula?");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      toast.error("Failed to complete registration.");
    }
  };

  const handleUpdateProfile = async (data: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), data, { merge: true });
      setProfile((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // 1. Delete user posts
      const userPosts = posts.filter(p => p.authorId === user.uid);
      const batch = writeBatch(db);
      userPosts.forEach(post => {
        batch.delete(doc(db, "posts", post.id));
      });
      
      // 2. Delete user profile
      batch.delete(doc(db, "users", user.uid));
      
      await batch.commit();
      
      // 3. Delete auth account
      await deleteUser(user);
      
      toast.success("Account deleted successfully. We're sorry to see you go!");
      setView('feed');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error("For security reasons, please log in again before deleting your account.");
        await logout();
      } else {
        toast.error("Failed to delete account. Please try again later.");
        console.error(error);
      }
    }
  };

  const handleCreatePost = async (data: any) => {
    if (!user || !profile) {
      toast.error("Please sign in to post.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const rawImageURL = await generateMealImage(data.mealCombo);
      const imageURL = await compressImage(rawImageURL, 800, 600, 0.7); // Posts can be slightly larger
      const path = "posts";
      await addDoc(collection(db, path), {
        ...data,
        imageURL,
        authorId: user.uid,
        authorName: profile.fullname,
        authorPhoto: profile.photoURL,
        createdAt: serverTimestamp(),
        likesCount: 0,
      });

      // Update streaks
      const userStreaks = streaks.filter(s => s.partnerIds.includes(user.uid));
      if (userStreaks.length > 0) {
        const batch = writeBatch(db);
        userStreaks.forEach(streak => {
          batch.update(doc(db, "streaks", streak.id), {
            lastActivity: serverTimestamp(),
            count: increment(1)
          });
        });
        await batch.commit();
      }

      toast.success("Meal combo shared!");
    } catch (error: any) {
      if (error.message === "INAPPROPRIATE_CONTENT") {
        toast.error("⚠️ Inappropriate content detected. Please keep your meal descriptions respectful.");
      } else {
        handleFirestoreError(error, OperationType.CREATE, "posts");
        toast.error("Failed to share post.");
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const context = posts.slice(0, 5).map(p => `${p.authorName} ate ${p.mealCombo} at ${p.location}`).join(". ");
    return await chatWithAssistant(message, context);
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like meals!");
      return;
    }

    const isLiked = userLikes.has(postId);
    const likeId = `${user.uid}_${postId}`;
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, "likes", likeId);

    try {
      const batch = writeBatch(db);
      
      if (isLiked) {
        batch.update(postRef, { likesCount: increment(-1) });
        batch.delete(likeRef);
      } else {
        batch.update(postRef, { likesCount: increment(1) });
        batch.set(likeRef, {
          userId: user.uid,
          postId: postId,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "posts/likes");
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) {
      handleLogin();
      return;
    }

    if (user.uid === targetUserId) {
      toast.error("You cannot follow yourself!");
      return;
    }

    const followId = `${user.uid}_${targetUserId}`;
    const isFollowing = following.has(targetUserId);

    try {
      const batch = writeBatch(db);
      if (isFollowing) {
        batch.delete(doc(db, "follows", followId));
        batch.update(doc(db, "users", user.uid), { followingCount: increment(-1) });
        batch.update(doc(db, "users", targetUserId), { followersCount: increment(-1) });
      } else {
        batch.set(doc(db, "follows", followId), {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        });
        batch.update(doc(db, "users", user.uid), { followingCount: increment(1) });
        batch.update(doc(db, "users", targetUserId), { followersCount: increment(1) });
      }
      await batch.commit();
      toast.success(isFollowing ? "Unfollowed" : "Following");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "follows");
      toast.error("Action failed");
    }
  };

  const handleBecomeStreakPartner = async (targetUserId: string) => {
    if (!user) {
      handleLogin();
      return;
    }

    if (user.uid === targetUserId) {
      toast.error("You cannot be streak partners with yourself!");
      return;
    }

    // Check if already partners
    const existingStreak = streaks.find(s => s.partnerIds.includes(targetUserId));
    if (existingStreak) {
      toast.info("Already streak partners!");
      return;
    }

    try {
      const streakId = [user.uid, targetUserId].sort().join('_');
      const batch = writeBatch(db);
      
      batch.set(doc(db, "streaks", streakId), {
        partnerIds: [user.uid, targetUserId],
        count: 0,
        lastActivity: serverTimestamp(),
        status: 'active',
        createdAt: serverTimestamp()
      });
      
      batch.update(doc(db, "users", user.uid), { streakCount: increment(1) });
      batch.update(doc(db, "users", targetUserId), { streakCount: increment(1) });
      
      await batch.commit();
      toast.success("Streak partnership started! Post meals together to grow your streak.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "streaks");
      toast.error("Failed to start streak");
    }
  };

  const handleResetApp = async () => {
    if (!user || user.email !== "bochieng228@gmail.com") return;
    
    try {
      const collectionsToClear = ["posts", "likes", "comments", "follows", "streaks"];
      for (const coll of collectionsToClear) {
        const snapshot = await getDocs(collection(db, coll));
        // Process in chunks of 500 (Firestore batch limit)
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batch = writeBatch(db);
          const chunk = docs.slice(i, i + 500);
          chunk.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      }

      const usersSnapshot = await getDocs(collection(db, "users"));
      const userDocs = usersSnapshot.docs;
      for (let i = 0; i < userDocs.length; i += 500) {
        const userBatch = writeBatch(db);
        const chunk = userDocs.slice(i, i + 500);
        chunk.forEach(doc => {
          if (doc.id !== user.uid) {
            userBatch.delete(doc.ref);
          } else {
            userBatch.update(doc.ref, {
              followersCount: 0,
              followingCount: 0,
              streakCount: 0
            });
          }
        });
        await userBatch.commit();
      }

      toast.success("App data has been reset! Starting fresh.");
      setView('feed');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "reset-app");
      toast.error("Failed to reset app data.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    if (!window.confirm("Are you sure you want to delete this meal combo?")) return;

    try {
      await deleteDoc(doc(db, "posts", postId));
      toast.success("Post deleted successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
      toast.error("Failed to delete post.");
    }
  };

  const handleGenerateVideo = async (postId: string, mealCombo: string) => {
    try {
      // Check if user has selected an API key (required for Veo)
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          toast.info("Video generation requires a paid Gemini API key. Please select one.");
          await aistudio.openSelectKey();
          // Skill guidance: proceed after triggering openSelectKey
        }
      }

      const videoURL = await generateMealVideo(mealCombo);
      await setDoc(doc(db, "posts", postId), { videoURL }, { merge: true });
      toast.success("AI Video generated successfully!");
    } catch (error: any) {
      const errorMsg = error.message || "";
      const isPermissionDenied = errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("permission") || error.status === "PERMISSION_DENIED";
      const isNotFound = errorMsg.includes("Requested entity was not found");

      if (error.message === "INAPPROPRIATE_CONTENT") {
        toast.error("Content restricted: Please keep it food-related.");
      } else if (isPermissionDenied || isNotFound) {
        toast.error("API Key error. Please ensure you have selected a valid paid API key.");
        await (window as any).aistudio?.openSelectKey();
      } else {
        toast.error("Failed to generate video. Please try again later.");
      }
      throw error;
    }
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.mealCombo.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.authorName.toLowerCase().includes(query)
      );
    }
    if (filter === "random") {
      result = result.sort(() => Math.random() - 0.5);
    } else if (filter === "my-posts" && user) {
      result = result.filter(p => p.authorId === user.uid);
    } else if (filter === "following" && user) {
      result = result.filter(p => following.has(p.authorId));
    }
    return result;
  }, [posts, searchQuery, filter, user, following]);

  const handleShare = (post: any) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out this meal: ${post.mealCombo}`,
        text: `I found this at ${post.location} for Ksh ${post.price}!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.href} - ${post.mealCombo} at ${post.location}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const stories = useMemo(() => {
    const uniqueAuthors = new Map();
    posts.forEach(p => {
      if (!uniqueAuthors.has(p.authorId)) {
        uniqueAuthors.set(p.authorId, {
          id: p.authorId,
          name: p.authorName,
          photoURL: p.authorPhoto,
          isTrending: (p.likesCount || 0) > 5
        });
      }
    });
    return Array.from(uniqueAuthors.values()).slice(0, 10);
  }, [posts]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "dark" : ""}`}>
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        onProfileClick={() => setView('profile')}
        onMyPostsClick={() => {
          setFilter('my-posts');
          setView('feed');
        }}
        onAddClick={() => setIsCreateModalOpen(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-24">
        <AnimatePresence mode="wait">
          {view === 'feed' ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Stories Section */}
              <Stories stories={stories} />

              {/* Search & Filter */}
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                  <Input 
                    placeholder="Search meals, locations, or students..." 
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-blue-500 h-11 shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3.5 text-blue-200/30 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                  <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-11 w-full grid grid-cols-3 md:inline-flex md:w-auto">
                    <TabsTrigger value="recent" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold">
                      Recent
                    </TabsTrigger>
                    <TabsTrigger value="random" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold">
                      Recommended
                    </TabsTrigger>
                    {user && (
                      <TabsTrigger value="following" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold">
                        Following
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>
              </div>

              {/* Feed */}
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PostCard 
                        post={post} 
                        user={user}
                        profile={profile}
                        isLiked={userLikes.has(post.id)}
                        isFollowing={following.has(post.authorId)}
                        isStreakPartner={streaks.some(s => s.partnerIds.includes(post.authorId))}
                        onLike={() => handleToggleLike(post.id)}
                        onFollow={() => handleFollow(post.authorId)}
                        onStreak={() => handleBecomeStreakPartner(post.authorId)}
                        onShare={handleShare} 
                        onDelete={handleDeletePost}
                        onGenerateVideo={handleGenerateVideo}
                        isAdmin={user?.email === "bochieng228@gmail.com"}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-20">
                  <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Search className="w-10 h-10 text-blue-400/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No meals found</h3>
                  <p className="text-blue-100/50">Try searching for something else or be the first to post!</p>
                </div>
              )}
            </motion.div>
          ) : (
            <ProfilePage 
              profile={profile} 
              onUpdate={handleUpdateProfile} 
              onDeleteAccount={handleDeleteAccount}
              onResetApp={handleResetApp}
              onBack={() => setView('feed')} 
              userPosts={posts.filter(p => p.authorId === user?.uid)}
              streaks={streaks}
              isAdmin={user?.email === "bochieng228@gmail.com"}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav 
        activeTab={view === 'profile' ? 'profile' : filter === 'my-posts' ? 'likes' : searchQuery ? 'search' : 'feed'}
        onTabChange={(tab) => {
          if (tab === 'profile') setView('profile');
          else if (tab === 'feed') {
            setFilter('recent');
            setSearchQuery("");
            setView('feed');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          else if (tab === 'likes') {
            setFilter('my-posts');
            setSearchQuery("");
            setView('feed');
          }
          else if (tab === 'search') {
            setView('feed');
            // Focus search input if possible, or just scroll to it
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            if (searchInput) {
              (searchInput as HTMLInputElement).focus();
              searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }}
        onAddClick={() => user ? setIsCreateModalOpen(true) : handleLogin()}
        user={user}
      />

      <ChatBot onSendMessage={handleSendMessage} />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        isGeneratingImage={isGeneratingImage}
      />

      <Toaster position="top-center" richColors theme={isDarkMode ? "dark" : "light"} />
    </div>
  );
}
